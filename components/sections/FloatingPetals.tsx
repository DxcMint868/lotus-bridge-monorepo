export const FloatingPetals = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
          }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full blur-sm" />
        </div>
      ))}
    </div>
  );
};
