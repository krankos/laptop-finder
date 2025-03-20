import { motion } from 'framer-motion';
import Link from 'next/link';
import { LaptopIcon, SearchIcon } from 'lucide-react';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-16"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-6 leading-relaxed text-center max-w-xl">
        <div className="flex flex-row justify-center gap-4 items-center text-primary">
          <LaptopIcon size={28} />
          <span>+</span>
          <SearchIcon size={28} />
        </div>
        
        <h2 className="text-xl font-medium">Votre assistant PC</h2>
        
        <p>
          Trouvez le pc idéal selon votre budget et vos besoins.
          Je vous aide à comparer les meilleurs modèles disponibles chez{' '}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://www.tunisianet.com.tn"
            target="_blank"
          >
            Tunisianet
          </Link>.
        </p>
      </div>
    </motion.div>
  );
};
