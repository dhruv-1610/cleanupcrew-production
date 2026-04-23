import mongoose from 'mongoose';
import { BadRequestError } from '../utils/errors';

/**
 * Validate that a string is a valid MongoDB ObjectId.
 * Returns true if valid, false otherwise.
 */
export function isValidObjectId(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  // Extra check: isValid('12charstring') returns true for 12-char strings
  // but they aren't hex ObjectIds. Ensure round-trip matches.
  return new mongoose.Types.ObjectId(id).toString() === id;
}

/**
 * Assert that a string is a valid MongoDB ObjectId.
 * Throws BadRequestError with a descriptive message if invalid.
 *
 * @param id - The string to validate
 * @param label - Human-readable label for the field (e.g. 'driveId', 'reportId')
 */
export function assertObjectId(id: unknown, label: string): asserts id is string {
  if (!isValidObjectId(id)) {
    throw new BadRequestError(`Invalid ${label}: must be a valid 24-character hex string`);
  }
}

/**
 * Safely create a mongoose ObjectId from a string.
 * Throws BadRequestError if the string is not a valid ObjectId.
 */
export function toObjectId(id: string, label: string): mongoose.Types.ObjectId {
  assertObjectId(id, label);
  return new mongoose.Types.ObjectId(id);
}
