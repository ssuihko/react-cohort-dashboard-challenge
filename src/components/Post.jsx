import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Comment from "./Comment";
import CreateComment from "./CreateComment";
import { useParams, Link } from "react-router-dom";

export default function Post({ post, posts, setPosts, contacts, findPost }) {
  const [user, setUser] = useState("");
  const [comments, setComments] = useState([]);
  const [showAllComments, setShowAllComments] = useState(false);
  const [formData, setFormData] = useState([]);
  const [update, setUpdate] = useState(false);
  const { id } = useParams(); // id of THE POST

  const toggleComments = () => {
    setShowAllComments(!showAllComments);
  };

  useState(() => {
    setFormData(post);
  }, []);

  useEffect(() => {
    if (id !== undefined) {
      // we have a post id
      fetch(
        `https://boolean-api-server.fly.dev/ssuihko/contact/${post.contactId}`
      )
        .then((response) => response.json())
        .then((data) => {
          setUser(data);
        });

      fetch(
        `https://boolean-api-server.fly.dev/ssuihko/post/${post.id}/comment`
      )
        .then((response) => response.json())
        .then((data) => {
          setComments(data);
        });
    } else {
      // console.log("id was null so here!");
      const thisUser = contacts.find((x) => parseInt(x.id) === post.contactId);
      // console.log(thisUser);
      setUser(thisUser);
    }
  }, [id, post, contacts]);

  useEffect(() => {
    if (comments.length > 0) {
      if (post.id !== comments[0].postId) {
        fetch(
          `https://boolean-api-server.fly.dev/ssuihko/post/${post.id}/comment`
        )
          .then((response) => response.json())
          .then((data) => {
            setComments(data);
          });
      }
    }
  }, [comments, post]);

  useState(() => {
    if (id === undefined) {
      fetch(
        `https://boolean-api-server.fly.dev/ssuihko/contact/${post.contactId}`
      )
        .then((response) => response.json())
        .then((data) => {
          setUser(data);
        });
    }
  }, [id]);

  useState(() => {
    fetch(`https://boolean-api-server.fly.dev/ssuihko/post/${post.id}/comment`)
      .then((response) => response.json())
      .then((data) => {
        setComments(data);
      });
  }, [id]);

  // DELETE
  const handleDeletePost = (id) => {
    const DEL_URL = "https://boolean-api-server.fly.dev/ssuihko/post/" + id;

    const deleteOptions = {
      method: "DELETE",
      url: DEL_URL,
    };

    let updatedList = posts.filter((item) => {
      if (parseInt(item.id) !== parseInt(id)) return item;
    });

    // https://boolean-api-server.fly.dev/ssuihko/post/{id}/comment doesn't work so the comments have to be deleted individually...
    comments.forEach((x) => {
      var DEL_URL_COMMENTS =
        "https://boolean-api-server.fly.dev/ssuihko/post/" +
        id +
        "/comment/" +
        x.id;

      var commentDeleteOptions = {
        method: "DELETE",
        url: DEL_URL_COMMENTS,
      };

      let updatedCommentList = comments.filter((item) => {
        if (parseInt(item.id) !== parseInt(x.id)) return item;
      });

      fetch(DEL_URL_COMMENTS, commentDeleteOptions)
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error(`Something went wrong! Status: ${res.status}`);
        })
        .then(() => {
          setComments([...updatedCommentList]);
        })
        .catch((err) => {
          console.log("error occured: ", err);
        });
    });

    fetch(DEL_URL, deleteOptions)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error(`Something went wrong! Status: ${res.status}`);
      })
      .then(() => {
        setPosts([...updatedList]);
      })
      .catch((err) => {
        console.log("error occured: ", err);
      });
  };

  const handleInputChange = (event) => {
    const { name, type, value } = event.target;
    // console.log("handleInput", name, type, value);

    if (name !== undefined) {
      setFormData({ ...formData, [name]: value });
    }
  };

  // UPDATE
  const handleUpdatePost = (formData) => {
    let updatedList = posts.map((item) => {
      if (parseInt(item.id) === parseInt(formData.id)) {
        return { ...item, ...formData };
      }
      return item;
    });

    const PUT_URL =
      "https://boolean-api-server.fly.dev/ssuihko/post/" + formData.id;

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
        setPosts([...updatedList]);
      })
      .catch((err) => {
        console.log("error occured: ", err);
      });

    setFormData(formData);
    setUpdate(false);
  };

  return (
    <article className="post-content">
      {user === undefined || user === "" ? (
        <p>loading...</p>
      ) : (
        <div>
          <div className="yellow">
            <button
              className="del-button"
              onClick={(e) => {
                e.preventDefault();
                handleDeletePost(post.id);
              }}
            >
              Delete
            </button>
            <button
              className="modify-btn"
              onClick={(e) => {
                e.preventDefault();
                setUpdate(!update);
              }}
            >
              Modify
            </button>
            <div className="profile-icon-contact">
              <div id="profile-icon-id-contact">
                {user.firstName.charAt(0) + "" + user.lastName.charAt(0)}
              </div>
            </div>
            <Link to={`/profile/${user.id}`} className="profile-link">
              <h4>{user.firstName + " " + user.lastName} </h4>
            </Link>
            {update ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdatePost(formData);
                }}
              >
                <div>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Add a title.."
                    value={formData.title ?? ""}
                    onChange={handleInputChange}
                  ></input>
                </div>

                <button type="submit" className="update-btn">
                  Update
                </button>

                <div className="textarea-section">
                  <textarea
                    id="content"
                    name="content"
                    type="text"
                    placeholder="Add a comment..."
                    value={formData.content ?? ""}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </form>
            ) : (
              <div className="post-article">
                <h5
                  onClick={(e) => {
                    e.preventDefault();
                    findPost(post.id);
                  }}
                >
                  <Link to={`/post/${post.id}`} className="post-title">
                    {post.title}
                  </Link>
                </h5>
                <p>{post.content}</p>
              </div>
            )}
          </div>
          <button
            className="show-comment-button"
            // id={`button-${post.id}`}
            onClick={() => toggleComments()}
          >
            See previous comments
          </button>
          <div>
            {showAllComments
              ? comments
                  .sort((a, b) => parseInt(b.postId) - parseInt(a.postId))
                  .map((comment, index) => (
                    <Comment
                      comment={comment}
                      comments={comments}
                      setComments={setComments}
                      contacts={contacts}
                      key={index}
                    />
                  ))
              : comments
                  .slice(0, 3)
                  .sort((a, b) => parseInt(b.postId) - parseInt(a.postId))
                  .map((comment, index) => (
                    <Comment
                      comment={comment}
                      comments={comments}
                      setComments={setComments}
                      contacts={contacts}
                      key={index}
                    />
                  ))}
          </div>
          <CreateComment
            comments={comments}
            setComments={setComments}
            post={post}
          />
        </div>
      )}
    </article>
  );
}

Post.propTypes = {
  post: PropTypes.object,
  posts: PropTypes.array,
  setPosts: PropTypes.func,
  contacts: PropTypes.array,
  findPost: PropTypes.func,
};
