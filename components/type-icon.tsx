import { File, Box, Code, Library } from 'lucide-react';

export const TypeIcon = ({ type, className }: { type: string, className?: string }) => {
  switch (type) {
    case 'Component': return <Box className={className} />;
    case 'Hook': return <Code className={className} />;
    case 'Lib': return <Library className={className} />;
    default: return <File className={className} />;
  }
};
