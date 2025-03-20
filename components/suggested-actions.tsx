'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { memo } from 'react';

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'Trouve-moi un ordinateur',
      label: 'avec un budget de 2000DT',
      action: 'Je cherche un bon ordinateur portable avec un budget de 2000DT pour une utilisation quotidienne',
    },
    {
      title: 'Recommande un PC gamer',
      label: 'avec de bonnes performances',
      action: 'Quel ordinateur portable gaming me recommandes-tu pour environ 3500DT?',
    },
    {
      title: 'PC pour le travail',
      label: 'pour usage professionnel',
      action: 'J\'ai besoin d\'un ordinateur portable fiable pour le travail avec une bonne autonomie autour de 2800DT',
    },
    {
      title: 'Recherche PC léger',
      label: 'avec longue autonomie',
      action: 'Quels sont les meilleurs ordinateurs portables légers avec une bonne autonomie sous 2500DT?',
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
