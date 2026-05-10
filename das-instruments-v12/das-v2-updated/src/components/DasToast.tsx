interface ToastProps {
  msg: string;
  show: boolean;
}

const DasToast = ({ msg, show }: ToastProps) => {
  return (
    <div className={`das-toast${show ? '' : ' hidden'}`}>
      <span>✓</span>{msg}
    </div>
  );
};

export default DasToast;
