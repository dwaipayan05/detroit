// controllers/chatController.js

const { QdrantClient } = require('@qdrant/js-client-rest');
const { ChatOpenAI } = require('@langchain/openai');
const { QdrantVectorStore } = require('@langchain/qdrant');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { pull } = require('langchain/hub');
const {
    RunnableSequence,
    RunnablePassthrough,
    RunnableMap,
} = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { ChatPromptTemplate } = require('@langchain/core/prompts');

const { formatDocumentsAsString } = require("langchain/util/document");


const systemPrompt =
  "You are an assistant for question-answering tasks. " +
  "Use the above pieces of retrieved context to answer " +
  "the question. If you don't know the answer, say that you " +
  "don't know. Use three sentences maximum and keep the " +
  "answer concise."
let ragChainWithSource;

async function initChatChain(repo_name, repo_owner) {
  const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_CLUSTER_URL,
    apiKey: process.env.QDRANT_API_TOKEN,
  });

  const embeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-3-large",
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings,{
        client: qdrantClient,
        url: process.env.QDRANT_CLUSTER_URL,
        collectionName: `${repo_owner}.${repo_name}`,
        contentPayloadKey: "page_content",
        metadataPayloadKey: "metadata",
    }
  )

  // Wrap in a retriever
  const retriever = vectorStore.asRetriever({
    k: parseInt(process.env.QDRANT_RETRIEVAL_K) || 5,
  });

  // Initialize the LLM
  const llm = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL_NAME || "gpt-4",
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0,
  });

  // Build the retrieval QA chain
  const prompt = await pull("rlm/rag-prompt");
  const ragChainFromDocs = RunnableSequence.from([
    RunnablePassthrough.assign({
        context: (input) => formatDocumentsAsString(input.context),
    }),
    prompt,
    llm,
    new StringOutputParser(),
  ]);


  ragChainWithSource = new RunnableMap({
    steps: {
        context: retriever,
        question: new RunnablePassthrough()
    }
  });
  ragChainWithSource = ragChainWithSource.assign({ answer: ragChainFromDocs });
  console.log("RAG chain initialized successfully");
}

exports.chat =  async (req, res) => {
  const { message } = req.body;
  const { repo_name, repo_owner } = req.query;
  if (!message) {
    return res.status(400).json({ error: "Missing `message` in request body" });
  }

  // Lazy init the chain on first request
  if (!ragChainWithSource) {
    try {
      await initChatChain(repo_name, repo_owner);
    } catch (err) {
      console.error("Failed to initialize chat chain:", err);
      return res.status(500).json({ error: "Server initialization error" });
    }
  }

  try {
    const response = await ragChainWithSource.invoke(message);
    return res.json({ response });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}