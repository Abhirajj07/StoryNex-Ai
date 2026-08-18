
import type { DialogueItem } from '../types/comic';

interface ComicSpeechBubbleProps {
  item: DialogueItem;
  characterColor?: string;
}

export default function ComicSpeechBubble({ item, characterColor }: ComicSpeechBubbleProps) {
  const getBubbleClass = () => {
    switch (item.delivery) {
      case 'shout': return 'bubble-shout';
      case 'whisper': return 'bubble-whisper';
      case 'thought': return 'bubble-thought';
      case 'sarcastic': return 'bubble-sarcastic';
      case 'muttered': return 'bubble-muttered';
      case 'trembling': return 'bubble-trembling';
      case 'cold': return 'bubble-cold';
      case 'excited': return 'bubble-excited';
      case 'narration': return 'bubble-narration';
      default: return 'bubble-normal';
    }
  };

  const getDeliveryIcon = () => {
    switch (item.delivery) {
      case 'shout': return '📢';
      case 'whisper': return '🤫';
      case 'thought': return '💭';
      case 'sarcastic': return '😏';
      case 'muttered': return '😶';
      case 'trembling': return '😰';
      case 'cold': return '🥶';
      case 'excited': return '🤩';
      default: return '💬';
    }
  };

  return (
    <div className={`speech-bubble ${getBubbleClass()}`}>
      <div className="bubble-header">
        <span
          className="bubble-speaker"
          style={{ color: characterColor || 'var(--color-accent)' }}
        >
          {item.speaker}
        </span>
        <span className="bubble-delivery" title={item.delivery}>
          {getDeliveryIcon()}
        </span>
      </div>
      <p className="bubble-text">{item.line}</p>
      <span className="bubble-delivery-label">{item.delivery}</span>
    </div>
  );
}
