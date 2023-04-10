import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

const conversation = []

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: 'OpenAI API key not configured, please follow instructions in README.md',
      }
    })
    return
  }

  const content = req.body.input || ''
  // validate input
  if (content.trim().length === 0) {
    res.status(400).json({
      error: {
        message: 'Please enter a valid message',
      }
    })
    return
  }

  try {
    // exit if user is not allowed
    if (isUserBanned()) {
      res.status(400).json({
        error: {
          message: 'You are not allowed to use this API',
        }
      })
      return
    }

    // add message to conversation
    updateConversation({content, isBot: false})
    
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo', // NOTE: model can be made dependent on user's package
      // max_tokens: 100, // NOTE: max_tokens can be made dependent on user's package
      messages: [
        ...conversation,
        { role: 'user', content }
      ],
      temperature: 0,
    })
    const result = completion.data.choices[0].message.content

    // add message to conversation
    updateConversation({content: result, isBot: true})

    // return the result
    res.status(200).json({ result, full: completion.data.choices })
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data)
      res.status(error.response.status).json(error.response.data)
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`)
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      })
    }
  }
}

function updateConversation ({content, isBot}) {
  // add the latest message to the conversation
  conversation.push({
    role: isBot ? 'assistant' : 'user',
    content
  })

  // remove oldest message if there are more than 10 messages
  // NOTE: MAX_CONVERSATION_LENGTH can be made dependent on user's package
  if (conversation.length > (process.env.MAX_CONVERSATION_LENGTH || 10)) {
    conversation.shift()
  }
}

// this method will later be updated to include logic such as whitelisting, blacklisting, API usages, etc.
function isUserBanned () {
  return false
}
