# Card Creator App

A cross-platform React Native application built with Expo that allows users to create and print custom greeting cards.

## Features

- **User Authentication**: Sign up and sign in functionality
- **Card Creation**: Upload images and add custom greetings
- **Print Cards**: Generate printable versions of created cards
- **Cross-Platform**: Works on iOS, Android, and Web

## Technology Stack

- **React Native**: Core UI framework
- **Expo**: Development platform
- **TypeScript**: For type-safe code
- **AsyncStorage**: For local data persistence
- **Expo Image Picker**: For image selection
- **Expo Print**: For generating printable cards
- **React Native Safe Area Context**: For safe layout across devices

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
```
git clone <repository-url>
cd printable-cards-app
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm start
```

4. Run on your preferred platform
```
npm run web     # For web
npm run ios     # For iOS
npm run android # For Android
```

## Usage

1. **Sign Up/Sign In**: Create a new account or sign in with your existing credentials
2. **Create a Card**: 
   - Select an image from your device
   - Add a custom greeting message
3. **Generate Printable Card**: Click the "Generate Printable Card" button to create a printable version
4. **Print or Save**: Print directly or save as PDF

## Project Structure

```
printable-cards-app/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignIn.tsx
│   │   │   └── SignUp.tsx
│   │   └── card/
│   │       └── CardCreator.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── screens/
│   │   ├── AuthScreen.tsx
│   │   └── HomeScreen.tsx
│   ├── services/
│   └── utils/
├── App.tsx
├── package.json
└── README.md
```

## Future Enhancements

- Add more card templates and customization options
- Implement cloud storage for saving cards
- Add social sharing capabilities
- Support for multiple card formats and sizes

## License

This project is licensed under the MIT License - see the LICENSE file for details 