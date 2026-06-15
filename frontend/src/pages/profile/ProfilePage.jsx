import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  updateProfile,
  changePassword,
  deleteAccount,
} from '../../features/auth/authSlice';
import useAuth from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { APP_NAME } from '../../utils/constants';
import { useState } from 'react';

const profileSchema = Yup.object({
  name: Yup.string().min(2).required('Name is required'),
  email: Yup.string().email().required('Email is required'),
});

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string().min(8, 'Min 8 characters').required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleProfileUpdate = async (values, { setSubmitting }) => {
    try {
      await dispatch(updateProfile(values)).unwrap();
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(
        changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        })
      ).unwrap();
      toast.success('Password changed successfully');
      resetForm();
    } catch (err) {
      toast.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await dispatch(deleteAccount()).unwrap();
      toast.success('Account deleted');
      navigate('/login');
    } catch (err) {
      toast.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Helmet>
        <title>Profile | {APP_NAME}</title>
      </Helmet>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-600">Manage your account settings</p>
      </div>

      <Card title="Account Info">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <Badge variant={user?.role === 'admin' ? 'info' : 'neutral'} className="mt-1">
              {user?.role || 'user'}
            </Badge>
          </div>
        </div>

        <Formik
          enableReinitialize
          initialValues={{ name: user?.name || '', email: user?.email || '' }}
          validationSchema={profileSchema}
          onSubmit={handleProfileUpdate}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form className="space-y-4">
              <Input
                label="Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && errors.name}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && errors.email}
              />
              <Button type="submit" loading={isSubmitting || loading}>
                Save Changes
              </Button>
            </Form>
          )}
        </Formik>
      </Card>

      <Card title="Change Password">
        <Formik
          initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
          validationSchema={passwordSchema}
          onSubmit={handlePasswordChange}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form className="space-y-4">
              <Input
                label="Current Password"
                name="currentPassword"
                type="password"
                value={values.currentPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.currentPassword && errors.currentPassword}
              />
              <Input
                label="New Password"
                name="newPassword"
                type="password"
                value={values.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.newPassword && errors.newPassword}
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword && errors.confirmPassword}
              />
              <Button type="submit" loading={isSubmitting}>
                Update Password
              </Button>
            </Form>
          )}
        </Formik>
      </Card>

      <Card title="Danger Zone">
        <p className="mb-4 text-sm text-slate-600">
          Permanently delete your account and all associated data.
        </p>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          Delete Account
        </Button>
      </Card>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Account"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleteLoading} onClick={handleDeleteAccount}>
              Delete Forever
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          This action is permanent and cannot be undone. Are you sure you want to delete your account?
        </p>
      </Modal>
    </div>
  );
}
