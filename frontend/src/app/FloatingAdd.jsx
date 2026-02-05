export default function FloatingAdd({ onClick }) {
  return (
    <button className="add-btn" onClick={onClick}>
      <img
        src="/assets/QuillLogoBlackBg.png"
        alt="Add note"
        className="add-icon"
      />
    </button>
  );
}
