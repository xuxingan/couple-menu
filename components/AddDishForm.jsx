import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function AddDishForm({ side, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('dishes')
        .insert([
          {
            name,
            description,
            image_url: image || null,
            created_by: side,
          }
        ]);

      if (error) throw error;
      
      setName('');
      setDescription('');
      setImage('');
      onSuccess?.();
      
    } catch (error) {
      console.error('Error:', error);
      alert('添加失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <input
          type="text"
          placeholder="菜品名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input input-bordered w-full"
          required
        />
      </div>
      
      <div className="form-control">
        <textarea
          placeholder="描述（可选）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea textarea-bordered"
          rows="3"
        />
      </div>
      
      <div className="form-control">
        <textarea
          placeholder="图片链接（可选）"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="textarea textarea-bordered"
          rows="2"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className={`btn btn-block ${
          side === 'male' 
            ? 'btn-primary bg-bili-blue hover:bg-bili-blue/80 border-0' 
            : 'btn-secondary bg-bili-pink hover:bg-bili-pink/80 border-0'
        }`}
      >
        {loading ? '上传中...' : '添加菜品'}
      </button>
    </form>
  );
} 