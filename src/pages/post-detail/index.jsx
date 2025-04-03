import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchPostDetail } from "../../api/index";
import PostItem from "../../components/post/index";
import Loading from "../../components/loading/index";

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleSelectPost = (postId) => {
    setSelectedPostId(postId === selectedPostId ? null : postId);
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await fetchPostDetail(postId);
        if (response && response.length > 0) {
          setPost(response[0]);
          setIsLoading(false);
        } else {
          console.warn("No post data found");
          setPost(null);
        }
      } catch (error) {
        console.error("Failed to fetch post detail:", error);
        setPost(null);
      }
    })();
  }, [postId, refreshTrigger]);

  if(isLoading) {
    return <Loading />;
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-xl-10">
          {post ? (
            <PostItem
              post={post}
              setRefreshTrigger={setRefreshTrigger}
              isSelected={selectedPostId === post.PostID}
              handleSelectPost={handleSelectPost}
              user={user}
            />
          ) : (
            <div>
              <img src="/imgs/loading__.gif" alt="loading" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;