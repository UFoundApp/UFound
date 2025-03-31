import { Button, CloseButton, Dialog, Portal, Text, Textarea } from "@chakra-ui/react";
import { useState } from "react";
import { getUser } from "../components/AuthPageUtil";
import axios from "axios";
import { FiFlag } from "react-icons/fi"; // <-- Clean outline-style flag icon

const ReportDialog = ({ endpoint }) => {
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
      await axios.post(endpoint, {
        user_id: user.id,
        reason: reason,
      });
      setFeedback({ msg: "Reported successfully.", isError: false });
      setIsOpen(false);
      resetForm();
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.detail) {
        setFeedback({ msg: err.response.data.detail, isError: true });
      } else {
        setFeedback({ msg: "Failed to report.", isError: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        p={1}
        _hover={{ bg: "gray.100" }}
        _active={{ bg: "gray.200" }}
        aria-label="Report"
        onClick={handleOpen}
      >
        <FiFlag size={20} />
      </Button>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Report</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Textarea
                  placeholder="Why are you reporting this?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isSubmitting}
                />
                {feedback.msg && (
                  <Text
                    color={feedback.isError ? "red.500" : "green.500"}
                    mt={2}
                    fontSize="sm"
                  >
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
