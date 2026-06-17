import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const schema = Yup.object({
  name: Yup.string().required('Name is required'),
  symbol: Yup.string().required('Symbol is required'),
  rank: Yup.number().typeError('Rank must be a number').required('Rank is required'),
  price: Yup.number().typeError('Price must be a number').required('Price is required'),
  marketCap: Yup.number().typeError('Market cap must be a number'),
  volume: Yup.number().typeError('Volume must be a number'),
  return24h: Yup.number().typeError('Return must be a number'),
  volatility: Yup.number().typeError('Volatility must be a number'),
});

const defaultValues = {
  name: '',
  symbol: '',
  rank: '',
  price: '',
  marketCap: '',
  volume: '',
  return24h: '',
  volatility: '',
};

export default function CoinModal({ open, onClose, onSubmit, initialValues, title, loading }) {
  const values = initialValues
    ? {
        name: initialValues.name || '',
        symbol: initialValues.symbol || '',
        rank: initialValues.rank ?? '',
        price: initialValues.price ?? '',
        marketCap: initialValues.marketCap ?? '',
        volume: initialValues.volume ?? '',
        return24h: initialValues.return24h ?? initialValues.return ?? '',
        volatility: initialValues.volatility ?? '',
      }
    : defaultValues;

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <Formik
        enableReinitialize
        initialValues={values}
        validationSchema={schema}
        onSubmit={async (formValues, { setSubmitting }) => {
          const payload = {
            ...formValues,
            rank: Number(formValues.rank),
            price: Number(formValues.price),
            marketCap: formValues.marketCap ? Number(formValues.marketCap) : undefined,
            volume: formValues.volume ? Number(formValues.volume) : undefined,
            return24h: formValues.return24h ? Number(formValues.return24h) : undefined,
            volatility: formValues.volatility ? Number(formValues.volatility) : undefined,
          };
          await onSubmit(payload);
          setSubmitting(false);
        }}
      >
        {({ values: fv, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Name" name="name" value={fv.name} onChange={handleChange} onBlur={handleBlur} error={touched.name && errors.name} />
            <Input label="Symbol" name="symbol" value={fv.symbol} onChange={handleChange} onBlur={handleBlur} error={touched.symbol && errors.symbol} />
            <Input label="Rank" name="rank" type="number" value={fv.rank} onChange={handleChange} onBlur={handleBlur} error={touched.rank && errors.rank} />
            <Input label="Price" name="price" type="number" value={fv.price} onChange={handleChange} onBlur={handleBlur} error={touched.price && errors.price} />
            <Input label="Market Cap" name="marketCap" type="number" value={fv.marketCap} onChange={handleChange} onBlur={handleBlur} />
            <Input label="Volume" name="volume" type="number" value={fv.volume} onChange={handleChange} onBlur={handleBlur} />
            <Input label="24h Return (%)" name="return24h" type="number" value={fv.return24h} onChange={handleChange} onBlur={handleBlur} />
            <Input label="Volatility" name="volatility" type="number" value={fv.volatility} onChange={handleChange} onBlur={handleBlur} />
            <div className="col-span-full flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting || loading}>
                Save
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
