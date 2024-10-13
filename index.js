import { NlpManager } from 'node-nlp';
import readline from 'readline';
import chalk from 'chalk';

const manager = new NlpManager({ languages: ['en'] });

// Train the NLP manager with some basic intents
async function trainNLP() {
  manager.addDocument('en', 'hello', 'greet');
  manager.addDocument('en', 'hi', 'greet');
  manager.addDocument('en', 'what is your name', 'name');
  manager.addDocument('en', 'who are you', 'name');
  manager.addDocument('en', 'what can you do', 'capabilities');
  manager.addDocument('en', 'help', 'capabilities');

  manager.addAnswer('en', 'greet', 'Hello! How can I assist you today?');
  manager.addAnswer('en', 'name', 'I am EggsGuy, your AI voice assistant.');
  manager.addAnswer('en', 'capabilities', 'I can answer questions, provide information, and assist with various tasks. Just ask me anything!');

  await manager.train();
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function processInput(input) {
  const result = await manager.process('en', input);
  if (result.intent === 'None') {
    console.log(chalk.yellow("I'm not sure how to respond to that. Can you please rephrase or ask something else?"));
  } else {
    console.log(chalk.green(result.answer));
  }
}

async function startAssistant() {
  console.log(chalk.blue('EggsGuy Voice Assistant is starting...'));
  await trainNLP();
  console.log(chalk.green('EggsGuy Voice Assistant is ready! Type your commands or questions.'));

  rl.on('line', async (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log(chalk.blue('Goodbye!'));
      rl.close();
      process.exit(0);
    }
    await processInput(input);
    rl.prompt();
  });

  rl.prompt();
}

startAssistant();