/**
 * Message Handler for Todo Refresh System
 * 
 * This utility analyzes AI conversation messages and determines when todo list refreshes
 * should be triggered based on message content analysis.
 */

interface MessageHandlerOptions {
  debounceMs?: number;
}

class MessageHandler {
  private lastTriggerTime: number = 0;
  private debounceMs: number;

  constructor(options: MessageHandlerOptions = {}) {
    this.debounceMs = options.debounceMs || 500;
  }

  /**
   * Analyzes message content to determine if it contains todo-related keywords
   * that should trigger a todo list refresh.
   */
  private containsTodoRelatedContent(message: string): boolean {
    const todoKeywords = [
      // Direct todo references
      'todo', 'task', 'reminder', 'checklist',
      
      // Action words that might relate to todos
      'create', 'add', 'update', 'delete', 'complete', 'finish',
      'schedule', 'plan', 'organize', 'manage',
      
      // Time-related words that often accompany todo creation
      'today', 'tomorrow', 'deadline', 'due', 'appointment',
      'meeting', 'event', 'calendar',
      
      // Productivity-related terms
      'productivity', 'workflow', 'project', 'goal',
      
      // Common todo management phrases
      'to do', 'need to', 'should do', 'remember to',
      'don\'t forget', 'make sure to'
    ];

    const lowercaseMessage = message.toLowerCase();
    
    return todoKeywords.some(keyword => 
      lowercaseMessage.includes(keyword.toLowerCase())
    );
  }

  /**
   * Analyzes message for specific action indicators that suggest todo manipulation
   */
  private containsActionIndicators(message: string): boolean {
    const actionPatterns = [
      // Direct action indicators
      /I'll (create|add|make|set up|schedule)/i,
      /I (created|added|made|scheduled|updated)/i,
      /I've (created|added|made|scheduled|updated)/i,
      /I can (help|assist|create|add|make|schedule)/i,
      
      // Todo management suggestions
      /you (should|could|might want to) (create|add|make)/i,
      /consider (creating|adding|making|scheduling)/i,
      /suggest (creating|adding|making|scheduling)/i,
      
      // Time-based suggestions
      /for (today|tomorrow|this week|next week)/i,
      /by (today|tomorrow|this week|next week)/i,
      
      // Organization suggestions
      /organize|prioritize|manage|track/i,
    ];

    return actionPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Main method to analyze a message and determine if it should trigger a todo refresh
   */
  shouldTriggerRefresh(message: string): boolean {
    // Check debouncing to prevent excessive refresh calls
    const now = Date.now();
    if (now - this.lastTriggerTime < this.debounceMs) {
      console.log('MessageHandler: Skipping refresh due to debouncing');
      return false;
    }

    // Analyze message content
    const hasTodoContent = this.containsTodoRelatedContent(message);
    const hasActionIndicators = this.containsActionIndicators(message);
    
    const shouldTrigger = hasTodoContent || hasActionIndicators;

    if (shouldTrigger) {
      console.log('MessageHandler: Todo-related content detected, triggering refresh');
      console.log('MessageHandler: Keywords found:', hasTodoContent);
      console.log('MessageHandler: Action indicators found:', hasActionIndicators);
      this.lastTriggerTime = now;
    } else {
      console.log('MessageHandler: No todo-related content detected');
    }

    return shouldTrigger;
  }

  /**
   * Reset the debounce timer (useful for testing or manual resets)
   */
  resetDebounce(): void {
    this.lastTriggerTime = 0;
  }
}

// Export a singleton instance for consistent behavior across the app
export const messageHandler = new MessageHandler();

// Export the class for testing or custom instances
export { MessageHandler };