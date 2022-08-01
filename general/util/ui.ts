import { ToastId, UseToastOptions } from '@chakra-ui/react';
import { SetStateAction } from 'react';

import { TOAST_DURATION, TOAST_POSITION } from 'general';

// ********************************************************************************
type DeleteObjectUIProcessProps = {
  deletedObjectName: string;
  isUpdatingCallback: (value: SetStateAction<boolean>) => void;
  toast: (options?: UseToastOptions | undefined) => ToastId;
  deleteCallback: () => Promise<void>;
  replaceRouteCallback: () => void;
  setShowDeleteModalCallback: (value: SetStateAction<boolean>) => void;
  setIsObjectDeletedCallback: (value: SetStateAction<boolean>) => void;
}
export const deleteObjectUIProcess = async (props: DeleteObjectUIProcessProps) => {
  const { deletedObjectName, isUpdatingCallback, toast, deleteCallback, replaceRouteCallback, setShowDeleteModalCallback, setIsObjectDeletedCallback } = props;
  try {
    isUpdatingCallback(true);
    toast({ title: `Eliminando ${deletedObjectName}...`, status: 'info', duration: TOAST_DURATION, position: TOAST_POSITION });
    await deleteCallback();
    toast({ title: `${deletedObjectName} eliminado correctamente. Regresando a la página anterior...`, status: 'success', duration: TOAST_DURATION, position: TOAST_POSITION });
    setTimeout(() => replaceRouteCallback(), TOAST_DURATION);
  } catch (error) {
    toast({ title: `Ocurrió un error mientras se eliminaba al ${deletedObjectName}`, status: 'error', duration: TOAST_DURATION, position: TOAST_POSITION });
    throw new Error(`Error: ${error}`);
  } finally {
    isUpdatingCallback(false);
    setShowDeleteModalCallback(false);
    setIsObjectDeletedCallback(true);
  }
};