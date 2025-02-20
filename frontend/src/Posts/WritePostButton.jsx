import { useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";

function WritePostButton() {
  const navigate = useNavigate();

  return (
    <Button bg="primary"color="white" size="lg" onClick={() => navigate("/create-post")}>
      Write a Post
    </Button>
  );
}

export default WritePostButton;
