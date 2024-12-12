import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function EditDishForm({ dish, onSuccess, onCancel }) {
  const [name, setName] = useState(dish.name);
  const [description, setDescription] = useState(dish.description || '');
  const [image, setImage] = useState(dish.image_url || '');
  const [loading, setLoading] = useState(false);
  const [cookingTime, setCookingTime] = useState(dish.cooking_time_minutes || 30);

  const getTimeLabel = (minutes) => {
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes ? 
      `${hours}小时${remainingMinutes}分` : 
      `${hours}小时`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('dishes')
        .update({
          name,
          description,
          image_url: image || null,
          cooking_time_minutes: cookingTime,
        })
        .eq('id', dish.id);

      if (error) throw error;
      
      onSuccess?.();
      
    } catch (error) {
      console.error('Error:', error);
      alert('修改失败，请重试');
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
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">烹饪时间</span>
          <span className="label-text-alt">{getTimeLabel(cookingTime)}</span>
        </label>
        <input 
          type="range" 
          min={15} 
          max={180} 
          step={15}
          value={cookingTime}
          onChange={(e) => setCookingTime(Number(e.target.value))}
          className="range range-primary" 
        />
        <div className="w-full flex justify-between text-xs px-2 mt-2">
          {[15, 30, 45, 60, 90, 120, 150, 180].map((minutes) => (
            <span key={minutes}>{getTimeLabel(minutes)}</span>
          ))}
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn flex-1"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary flex-1"
        >
          {loading ? '保存中...' : '保存修改'}
        </button>
      </div>
    </form>
  );
} 