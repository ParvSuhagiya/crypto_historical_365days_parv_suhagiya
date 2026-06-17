import Button from './Button';

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-12 text-center">
      <div className="mb-3 text-4xl">⚠️</div>
      <h3 className="text-lg font-semibold text-red-800">Error</h3>
      <p className="mt-2 max-w-md text-sm text-red-600">{message}</p>
      {onRetry && (
        <Button variant="danger" className="mt-6" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
