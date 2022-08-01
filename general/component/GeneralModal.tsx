import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';

// ********************************************************************************
// == Interface ===================================================================
interface ModalButton {
  text: string;
  onClick: () => void;
  isLoading: boolean;
  isDisabled: boolean;
}
interface Props {
  modalTitle: string;
  bodyString: string;
  isOpen: boolean;
  onClose: () => void;
  buttons: ModalButton[];
}

// == Component ===================================================================
export const GeneralModal: React.FC<Props> = ({ modalTitle, bodyString, isOpen, onClose, buttons }) =>
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>{modalTitle}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {bodyString}
      </ModalBody>
      <ModalFooter>
        {buttons.map((button, buttonIndex) =>
          <Button
            key={buttonIndex}
            variant='ghost'
            colorScheme='blue'
            isDisabled={button.isDisabled}
            isLoading={button.isLoading}
            onClick={() => button.onClick()}
          >
            {button.text}
          </Button>
        )}
      </ModalFooter>
    </ModalContent>
  </Modal>;
