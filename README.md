# AI Chat Client

A modern, clean chat client for AI models with OpenRouter support and multi-provider compatibility.

## Features

- **Clean, Modern Interface**: Simple and intuitive chat interface
- **Multi-turn Conversations**: Full conversation history with context
- **Model Selection**: Dynamic model selection with detailed information
- **Custom Prompts**: Configure system and developer prompts
- **Multiple Providers**: Support for OpenRouter, OpenAI, and custom OpenAI-compatible providers (Anthropic models are available through OpenRouter)
- **API Key Management**: In-app API key configuration (no environment variables needed)
- **Streaming Responses**: Real-time streaming for better user experience
- **Dynamic Model Discovery**: Automatically fetch available models from any provider

## Getting Started

### Prerequisites

- Node.js 20.9+
- npm or yarn

### Installation

1. Clone or download this project
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Configuration

1. **Open Settings**: Click the settings icon (⚙️) in the top-left corner
2. **Configure API Provider**: 
   - Select a predefined provider (OpenRouter or OpenAI) or add a custom one
   - Enter your API key
3. **Select Model**: Choose from the automatically loaded model list
4. **Set Prompts** (optional): Configure system and developer prompts
5. **Adjust Advanced Settings** (optional): Temperature, max tokens, etc.

### OpenRouter Setup

1. Go to [OpenRouter](https://openrouter.ai)
2. Create an account and get your API key
3. In the chat client, select "OpenRouter" as your provider
4. Enter your API key
5. Models will automatically load

### Custom Providers

You can add any OpenAI-compatible API provider:

1. In settings, select "Custom" as your provider
2. Enter the provider name, base URL, and API key
3. Specify the models endpoint (usually `/models`)
4. Save the configuration

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main chat page
├── components/            # React components
│   ├── ChatHistory.tsx    # Message display
│   ├── ChatInput.tsx      # Message input
│   ├── ChatMessage.tsx    # Individual message
│   ├── ModelSelector.tsx  # Model selection dropdown
│   └── SettingsPanel.tsx  # Settings sidebar
├── hooks/                 # Custom React hooks
│   └── useChat.ts         # Chat logic and state
├── types/                 # TypeScript type definitions
│   └── index.ts           # Main types
└── utils/                 # Utility functions
    ├── api.ts             # API client
    └── streaming.ts       # Streaming response parser
```

## API Compatibility

This client is designed to work with any OpenAI-compatible API that supports:

- `/models` endpoint for listing available models
- `/chat/completions` endpoint for chat completions
- Server-sent events (SSE) streaming

Tested providers:
- ✅ OpenRouter
- ✅ OpenAI
- ✅ Anthropic (via OpenRouter)
- ✅ Local models (Ollama, LM Studio, etc.)

## Features in Detail

### Multi-Provider Support
- Easy switching between different AI providers
- Custom provider configuration
- Dynamic model loading based on API key and endpoint

### Advanced Settings
- **Temperature**: Control response creativity (0.0 = focused, 2.0 = creative)
- **Max Tokens**: Limit response length
- **System Prompts**: Set AI behavior and personality
- **Developer Prompts**: Additional context for conversations

### User Experience
- Real-time streaming responses
- Loading indicators and status updates
- Error handling with helpful messages
- Responsive design for different screen sizes

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Technologies Used

- **Next.js 16** - React framework with app directory
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Headless UI** - Accessible UI components
- **Heroicons** - Icon library

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Troubleshooting

### Common Issues

1. **Models not loading**: Check your API key and internet connection
2. **Messages not sending**: Verify your API key and selected model
3. **Streaming not working**: Some providers may not support streaming - check the provider's documentation

### Getting Help

- Check the browser console for error messages
- Verify your API key is correct and has sufficient credits
- Test with a different model or provider
- Ensure your internet connection is stable

## Roadmap

- [ ] Conversation history persistence
- [ ] Export/import conversations
- [ ] Custom themes
- [ ] Message editing and regeneration
- [ ] File upload support
- [ ] Voice input/output
- [ ] Plugin system for extended functionality
