function ProfileModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div
        className="modal-user-section"
        
      >
        <div className="modal-dialog-wrp">
          <div className="modal-content-wrap">

            <div className="modal-body-wrap">
              <h6>Hi, User</h6>

              <button className="btn btn-danger">
                Logout
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Click outside to close */}
      <div
        className="modal-backdrop-wrap"
        onClick={onClose}
      ></div>
    </>
  );
}

export default ProfileModal;