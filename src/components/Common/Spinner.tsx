export default function Spinner({ size = 24 }: { size?: number }) {
  const px = `${size}px`;
  return (
    <div
      role="status"
      aria-label="Loading"
      className="inline-block animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"
      style={{ width: px, height: px }}
    />
  );
}

