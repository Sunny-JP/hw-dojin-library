import AddDoujinshiForm from '@/components/AddDoujinshiForm';

export default function AddNewPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      <h1>新規同人誌登録</h1>
      <AddDoujinshiForm />
    </div>
  );
}