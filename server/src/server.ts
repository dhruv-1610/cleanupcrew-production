import 'dotenv/config';
import './types';
import { app } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { logger } from './config/logger';

// ── Global error handlers — prevent ANY crash ─────────────────────────────

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception — keeping server alive', {
    message: error.message,
    stack: error.stack,
    name: error.name,
  });
  // Do NOT call process.exit() — keep the server running
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection — keeping server alive', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  // Do NOT call process.exit() — keep the server running
});

/**
 * Bootstrap the API server:
 * 1. Connect to MongoDB (with retry).
 * 2. Start the HTTP listener.
 */
async function bootstrap(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.PORT, env.API_HOST, () => {
    logger.info(`Server running on http://${env.API_HOST}:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully…`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    // Force exit after 10s
    setTimeout(() => process.exit(1), 10_000);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error: unknown) => {
  logger.error('Failed to start server', { error: String(error) });
  process.exit(1);
});
