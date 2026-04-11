import Modal from '../../../../shared/ui/Modal/Modal.jsx'
import PlanAddForm from '../PlanAddForm/PlanAddForm.jsx'

export default function PlanAddModal({ open, onClose, courses, onCreated, formKey }) {
  return (
    <Modal open={open} onClose={onClose} title="新建计划任务">
      {open ? (
        <PlanAddForm key={formKey} courses={courses} onCreated={onCreated} variant="modal" />
      ) : null}
    </Modal>
  )
}
