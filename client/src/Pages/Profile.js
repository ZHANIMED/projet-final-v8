import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../JS/redux/slices/authSlice";
import ConfirmModal from "../Components/ConfirmModal";
import api from "../JS/api/axios";
import { toast } from "react-toastify";

export default function Profile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.photo || "");
  const [errorMsg, setErrorMsg] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const fallbackAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const getUserPhoto = (photo) => {
    if (!photo) return fallbackAvatar;
    if (photo.startsWith("http")) return photo;
    if (photo.startsWith("blob:")) return photo;
    return `/${photo}`;
  };

  // ✅ si user change (reload/login), on resync
  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setAddress(user?.address || "");
    setAvatarPreview(user?.photo || "");
    setAvatarFile(null);
  }, [user]);

  // ✅ clean object url
  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const onPickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Veuillez choisir une image (png, jpg, jpeg, webp).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("L'image est trop grande. La taille maximale est de 2Mo.");
      return;
    }

    // revoke old blob
    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onCancel = () => {
    setEditing(false);
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setAddress(user?.address || "");
    setAvatarFile(null);

    // remove preview blob
    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(user?.photo || "");
  };

  const onSave = async () => {
    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("phone", phone.trim());
    fd.append("address", address.trim());
    if (avatarFile) {
      fd.append("photo", avatarFile);
    }

    try {
      await dispatch(updateProfile(fd)).unwrap();
      setEditing(false);
    } catch (error) {
      setErrorMsg("Erreur lors de la mise à jour : " + error);
    }
  };

  // ✅ valeur affichée dans la page :
  const displayName = editing ? name : user?.name;

  const sendAdminMessage = async () => {
    const content = adminMessage.trim();
    if (!content) return;

    try {
      setSendingMessage(true);
      await api.post("/messages", { content });
      setAdminMessage("");
      toast.success("Votre message a été envoyé à l'administrateur.");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Erreur lors de l'envoi du message. Veuillez réessayer.";
      toast.error(msg);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="container">
      <div className="profileHeader">
        <div>
          <h1 className="profileTitle">Profil</h1>
          <p className="profileSub">Gérez vos informations personnelles</p>
        </div>
      </div>

      <section className="profileCard">
        <div className="profileTop">
          <div className="avatarWrap">
            <img
              className="avatar"
              src={getUserPhoto(avatarPreview || user?.photo)}
              alt={user?.name || "profil"}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackAvatar;
              }}
            />

            {editing && (
              <label className="avatarEdit">
                Changer
                <input type="file" accept="image/*" onChange={onPickAvatar} />
              </label>
            )}
          </div>

          <div className="profileMeta">
            {!editing ? (
              <>
                <div className="profileName">{displayName || "Utilisateur"}</div>
                <div className="profileRole">
                  <span className="ecoDot" /> {user?.isAdmin ? "Admin" : "Client"}
                </div>
              </>
            ) : (
              <div className="profileForm">
                <div className="field">
                  <span className="fieldLabel">Nom</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom"
                  />
                </div>

                <div className="field">
                  <span className="fieldLabel">Téléphone</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Votre téléphone"
                  />
                </div>

                <div className="field">
                  <span className="fieldLabel">Adresse</span>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Votre adresse"
                  />
                </div>

                <div className="field">
                  <span className="fieldLabel">Email</span>
                  <input
                    value={user?.email || ""}
                    disabled
                    className="inputDisabled"
                    placeholder="Email"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="profileActions">
            {!editing ? (
              <button className="pBtn pBtnPrimary" onClick={() => setEditing(true)}>
                Modifier
              </button>
            ) : (
              <>
                <button className="pBtn pBtnPrimary" onClick={onSave} disabled={loading}>
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button className="pBtn pBtnGhost" onClick={onCancel} disabled={loading}>
                  Annuler
                </button>
              </>
            )}
          </div>
        </div>

        <div className="profileGrid">
          <div className="infoLine">
            <span className="infoLabel">Nom</span>
            <span className="infoValue">{displayName || "—"}</span>
          </div>

          <div className="infoLine">
            <span className="infoLabel">Email</span>
            <span className="infoValue">{user?.email || "—"}</span>
          </div>

          <div className="infoLine">
            <span className="infoLabel">Téléphone</span>
            <span className="infoValue">{user?.phone || "—"}</span>
          </div>

          <div className="infoLine">
            <span className="infoLabel">Adresse</span>
            <span className="infoValue">{user?.address || "—"}</span>
          </div>

          <div className="infoLine">
            <span className="infoLabel">Rôle</span>
            <span className="infoValue">{user?.isAdmin ? "Admin" : "Client"}</span>
          </div>
        </div>
      </section>

      {/* Message privé à l'admin */}
      <section className="panel" style={{ marginTop: 24 }}>
        <h2 className="sectionTitle">Contacter l'administrateur</h2>
        <p className="sectionSub">
          Envoyez un message privé à l'équipe. Il sera uniquement visible par
          l'administrateur et déclenchera une notification.
        </p>
        <div className="field" style={{ marginTop: 10 }}>
          <span className="fieldLabel">Votre message</span>
          <textarea
            rows={4}
            value={adminMessage}
            onChange={(e) => setAdminMessage(e.target.value)}
            placeholder="Écrivez ici votre remarque, question ou demande spécifique..."
            style={{ resize: "vertical" }}
          />
        </div>
        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            className="btnPrimary"
            onClick={sendAdminMessage}
            disabled={sendingMessage || !adminMessage.trim()}
            style={{ marginTop: 0 }}
          >
            {sendingMessage ? "Envoi..." : "Envoyer le message"}
          </button>
        </div>
      </section>

      {errorMsg && (
        <ConfirmModal
          title="Attention"
          message={errorMsg}
          onConfirm={() => setErrorMsg("")}
          alertMode={true}
          type="warning"
        />
      )}
    </div>
  );
}