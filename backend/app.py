import speech_recognition as sr
import pyttsx3
import openai
import sqlite3
from flask import Flask, request, jsonify
import pyautogui
import os

# Initialize OpenAI API
openai.api_key = 'YOUR_OPENAI_API_KEY'  # Replace with your OpenAI API key

# Initialize Text-to-Speech
engine = pyttsx3.init()

# Initialize Flask web server
app = Flask(__name__)

# Initialize SQLite database
conn = sqlite3.connect('eggs_data.db', check_same_thread=False)
cursor = conn.cursor()
cursor.execute('''
CREATE TABLE IF NOT EXISTS commands (
    id INTEGER PRIMARY KEY,
    command TEXT,
    response TEXT,
    feedback INTEGER
)
''')

# Function to speak out text
def speak(text):
    engine.say(text)
    engine.runAndWait()

# Function to listen for voice input
def listen():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        audio = recognizer.listen(source)

        try:
            command = recognizer.recognize_google(audio)
            print(f"You said: {command}")
            return command.lower()
        except sr.UnknownValueError:
            print("Sorry, I couldn't understand that.")
            return None
        except sr.RequestError:
            print("Could not request results from Google.")
            return None

# Function to execute user commands
def execute_command(command):
    response = ""
    if 'create function' in command:
        func_name = command.replace('create function', '').strip()
        response = f"Function {func_name} created! Now I can do that."
        cursor.execute("INSERT INTO commands (command, response) VALUES (?, ?)", (func_name, response))
        conn.commit()
    elif 'feedback' in command:
        feedback = int(command.split()[-1])
        cursor.execute("UPDATE commands SET feedback = ? WHERE id = ?", (feedback, 1))  # Update feedback for command with id 1
        conn.commit()
        response = "Thank you for your feedback!"
    elif 'open' in command and 'browser' in command:
        os.system("start chrome")  # Adjust for the browser you want to open
        response = "Opening the web browser."
    elif 'what is' in command:
        query = command.replace('what is', '').strip()
        openai_response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": query}]
        )
        response = openai_response.choices[0].message.content
        cursor.execute("INSERT INTO commands (command, response) VALUES (?, ?)", (query, response))
        conn.commit()
    elif 'create file' in command:
        file_name = command.replace('create file', '').strip() + '.txt'
        with open(file_name, 'w') as file:
            file.write("This is a new file created by EggsGuy.")
        response = f"File {file_name} created."
    elif 'edit file' in command:
        file_name = command.replace('edit file', '').strip() + '.txt'
        if os.path.exists(file_name):
            response = f"Editing {file_name}."
            with open(file_name, 'a') as file:
                file.write("\nEdited by EggsGuy.")
        else:
            response = f"File {file_name} does not exist."
    elif 'delete file' in command:
        file_name = command.replace('delete file', '').strip() + '.txt'
        if os.path.exists(file_name):
            os.remove(file_name)
            response = f"File {file_name} deleted."
        else:
            response = f"File {file_name} does not exist."
    elif 'take a screenshot' in command:
        screenshot = pyautogui.screenshot()
        screenshot.save('screenshot.png')
        response = "Screenshot taken."
    else:
        response = "I'm not sure how to do that yet. Let's learn together!"
    
    speak(response)
    return response

# Flask API for external commands
@app.route('/api/command', methods=['POST'])
def api_command():
    command = request.json['command']
    response = execute_command(command)
    return jsonify({"response": response})

# Main function to run the assistant
def main():
    speak("Welcome to EggsGuy Voice Assistant! Ready to learn together?")
    while True:
        command = listen()
        if command:
            execute_command(command)
        else:
            speak("What was that? Speak up!")

if __name__ == "__main__":
    app.run(port=5000)  # Start the web server