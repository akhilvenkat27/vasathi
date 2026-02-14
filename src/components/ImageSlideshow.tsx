import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageSlideshowProps {
    images?: string[];
    className?: string;
    aspectRatio?: 'video' | 'square' | 'wide';
}

const ImageSlideshow = ({ images = [], className = '', aspectRatio = 'video' }: ImageSlideshowProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!images || images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000); // 5 seconds interval
        return () => clearInterval(interval);
    }, [images]);

    const ratioClass = {
        video: 'aspect-video',
        square: 'aspect-square',
        wide: 'aspect-[21/9]'
    }[aspectRatio];

    if (!images || images.length === 0) {
        return (
            <div className={`${ratioClass} ${className} bg-slate-50 flex flex-col items-center justify-center text-slate-300 rounded-xl border border-slate-100`}>
                <ImageIcon className="h-10 w-10 opacity-10 mb-2" />
                <span className="text-xs font-semibold opacity-30">No Images Available</span>
            </div>
        );
    }

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className={`relative group overflow-hidden ${ratioClass} ${className} rounded-xl shadow-inner bg-slate-100`}>
            <AnimatePresence mode="wait">
                <motion.img
                    key={currentIndex}
                    src={images[currentIndex]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="w-full h-full object-cover"
                    alt={`Slide ${currentIndex + 1}`}
                />
            </AnimatePresence>

            {images.length > 1 && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/20 backdrop-blur-md text-white border-0 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/40"
                        onClick={handlePrev}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/20 backdrop-blur-md text-white border-0 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/40"
                        onClick={handleNext}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/10 backdrop-blur-lg border border-white/10">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-white shadow-sm' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ImageSlideshow;
