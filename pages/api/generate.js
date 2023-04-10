import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const animal = req.body.animal || '';
  if (animal.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid animal",
      }
    });
    return;
  }

  try {
    // const completion = await openai.createCompletion({
    const completion = await openai.createChatCompletion({
      // model: "text-davinci-003",
      model: "gpt-3.5-turbo",
      // prompt: animal || 'Hello. Who are you?',
      // prompt: generatePrompt(animal),
      // max_tokens: 100,
      messages: [
        // {"role": "user", "content": "who won the last fifa world cup?"},
        // {"role": "assistant", "content": "France won the last FIFA World Cup in 2018."},
        { role: 'user', content: animal }
      ],
      temperature: 0,
    });
    res.status(200).json({ result: completion.data.choices[0].message.content, full: completion.data.choices });
    // res.status(200).json({ result: completion.data.choices[0].text, full: completion.data.choices });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(animal) {
  const capitalizedAnimal =
    animal[0].toUpperCase() + animal.slice(1).toLowerCase();
  return `Suggest three names for an animal that is a superhero.

Animal: Cat
Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
Animal: Dog
Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
Animal: ${capitalizedAnimal}
Names:`;
}
