# Cortex Proof

A cognitive AI system that learns and adapts to individual users through memory and personalization.

## Repository Structure

```
cortex-proof/
├── cortex-app/          # 🌐 Main Next.js web application (production)
├── src/                 # 🧪 CLI proof-of-concept for memory comparison
├── docs/                # 📚 Architecture documentation
└── package.json         # Root package for CLI experiments
```

## Projects

### 🌐 Cortex App (Production)

The main web application deployed at https://cortex-app-rosy.vercel.app

**Tech Stack**: Next.js 16, Supabase, Tailwind CSS, Vercel AI SDK

See [cortex-app/README.md](cortex-app/README.md) for details.

```bash
cd cortex-app
npm install
npm run dev
```

### 🧪 CLI Proof of Concept

Command-line tool for testing and comparing different memory approaches (V1 natural language vs V2 CORTEX Protocol).

```bash
npm install
npm start
```

Commands:
- `v1` - Switch to V1 natural language mode
- `v2` - Switch to V2 CORTEX Protocol mode
- `quit` - Exit the program

## Documentation

- [Cognitive Architecture V2](docs/CORTEX-COGNITIVE-ARCHITECTURE-V2.md) - The CORTEX Protocol design
- [V3 MVP Implementation](docs/CORTEX-V3-MVP-IMPLEMENTATION.md) - Production implementation notes

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

For the web app, see `cortex-app/.env.example` for additional Supabase configuration.

## License

Private - Quantum Theory
