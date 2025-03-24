import { Button, CloseButton, Dialog, Portal, Text, Textarea } from "@chakra-ui/react";
import { useState } from "react";
import { getUser } from "../components/AuthPageUtil";
import axios from "axios";

const ReportDialog = ({ postId }) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ msg: "", isError: false });
  const [isOpen, setIsOpen] = useState(false);

  const resetForm = () => {
    setFeedback({ msg: "", isError: false });
    setReason("");
  };

  const handleOpen = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    const user = await getUser();
    if (!user || !user.id) {
      setFeedback({ msg: "You must be logged in to report.", isError: true });
      return;
    }
    if (!reason.trim()) {
      setFeedback({ msg: "Please state your reason.", isError: true });
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(`http://localhost:8000/api/posts/${postId}/report`, {
        user_id: user.id,
        reason: reason,
      });
      setFeedback({ msg: "Post reported successfully.", isError: false });
      setIsOpen(false); // Auto-close on success
      resetForm();
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.detail) {
        setFeedback({ msg: err.response.data.detail, isError: true });
      } else {
        setFeedback({ msg: "Failed to report post.", isError: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        colorScheme="red"
        size="sm"
        leftIcon={<CloseButton size="xs" />}
        onClick={handleOpen}
      >
        Report
      </Button>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Report this Post</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Textarea
                  placeholder="Why are you reporting this post?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isSubmitting}
                />
                {feedback.msg && (
                  <Text color={feedback.isError ? "red.500" : "green.500"} mt={2} fontSize="sm">
                    {feedback.msg}
                  </Text>
                )}
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant="outline"
                  isDisabled={isSubmitting}
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  isLoading={isSubmitting}
                  onClick={handleSubmit}
                >
                  Submit Report
                </Button>
              </Dialog.Footer>
              <CloseButton
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                position="absolute"
                top="10px"
                right="10px"
              />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default ReportDialog;
