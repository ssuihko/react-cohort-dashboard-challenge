import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { PostContext } from "./Post";
import sendIcon from "../assets/images/sendicon.png";
import Icon from "./Icon";

// comments, setComments, contacts
function Comment({ comment }) {
  const postContext = useContext(PostContext);
  const [user, setUser] = useState("");
  const [update, setUpdate] = useState(false);
  const [formData, setFormData] = useState({});

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name !== undefined) {
      setFormData({ ...formData, [name]: value });
    }
  };

  // DELETE
  const handleDeleteComment = (id) => {
    const DEL_URL =
      "https://boolean-api-server.fly.dev/ssuihko/post" +
      "/" +
      comment.postId +
      "/comment/" +
      id;

    const deleteOptions = {
      method: "DELETE",
      url: DEL_URL,
    };

    let updatedList = postContext.comments.filter((item) => {
      if (parseInt(item.id) !== parseInt(id)) return item;
    });

    fetch(DEL_URL, deleteOptions)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error(`Something went wrong! Status: ${res.status}`);
      })
      .then(() => {
        postContext.setComments([...updatedList]);
      })
      .catch((err) => {
        console.log("error occured: ", err);
      });
  };

  // UPDATE
  const handleUpdateComment = (formData) => {
    let updatedList = postContext.comments.map((item) => {
      if (parseInt(item.id) === parseInt(formData.id)) {
        return { ...item, ...formData };
      }
      return item;
    });

    const PUT_URL =
      "https://boolean-api-server.fly.dev/ssuihko/post" +
      "/" +
      formData.postId +
      "/comment/" +
      formData.id;

    const putOptions = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    fetch(PUT_URL, putOptions)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error(`Something went wrong! Status: ${res.status}`);
      })
      .then(() => {
        postContext.setComments([...updatedList]);
      })
      .catch((err) => {
        console.log("error occured: ", err);
      });

    setFormData(formData);
    setUpdate(false);
  };

  useEffect(() => {
    const thisUser = postContext.contacts.find(
      (x) => parseInt(x.id) === parseInt(comment.contactId)
    );
    setUser(thisUser);
  }, [postContext.contacts, comment.contactId]);

  return (
    <div className="comment-container">
      {user === undefined || user === "" ? (
        <p>loading...</p>
      ) : (
        <Icon user={user} />
      )}
      <div className="div-comment">
        {user === undefined || user === "" ? (
          <p>loading...</p>
        ) : (
          <div className="comment-background">
            <button
              className="del-button"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteComment(comment.id);
              }}
            >
              Delete
            </button>
            <button
              className="modify-btn"
              onClick={(e) => {
                e.preventDefault();
                setFormData(comment);
                setUpdate(!update);
              }}
            >
              Modify
            </button>
            <Link to={`/profile/${user.id}`} className="profile-link">
              <h4>{user.firstName + " " + user.lastName} </h4>
            </Link>
            {update ? (
              <form
                className="update-comment-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateComment(formData);
                }}
              >
                <div className="update-comment-field">
                  <input
                    className="update-comment-input"
                    id="content"
                    name="content"
                    type="text"
                    placeholder={`${formData.content}`}
                    value={formData.content ?? ""}
                    onChange={handleInputChange}
                  ></input>
                  <button type="submit" className="img-update-btn">
                    <img className="update-button-img" src={sendIcon} />
                  </button>
                </div>
              </form>
            ) : (
              <p>{comment.content}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Comment;

Comment.propTypes = {
  comment: PropTypes.object,
};
