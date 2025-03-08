// pages/admins/content/components/AlertMessage.tsx

interface AlertMessageProps {
    type: 'error' | 'success';
    message: string;
  }
  
  const AlertMessage: React.FC<AlertMessageProps> = ({ type, message }) => {
    if (!message) return null;
  
    const iconColor = type === 'error' ? 'text-red-400' : 'text-green-400';
    const bgColor = type === 'error' ? 'bg-red-50' : 'bg-green-50';
    const borderColor = type === 'error' ? 'border-red-400' : 'border-green-400';
    const textColor = type === 'error' ? 'text-red-700' : 'text-green-700';
  
    return (
      <div className={`mb-4 ${bgColor} border-l-4 ${borderColor} p-4 rounded-lg shadow-sm`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {type === 'error' ? (
              <svg
                className={`h-5 w-5 ${iconColor}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className={`h-5 w-5 ${iconColor}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <p className={`text-sm ${textColor}`}>{message}</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default AlertMessage;