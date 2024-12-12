import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { chatWithAIJson } from '../utils/aiClient';
import IngredientsEditor from './IngredientsEditor';

export default function AddDishForm({ side, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [cookingTime, setCookingTime] = useState(30);
  const [ingredients, setIngredients] = useState([]);
  const [showIngredientsEditor, setShowIngredientsEditor] = useState(false);
  const [fetchingIngredients, setFetchingIngredients] = useState(false);

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

  const fetchIngredients = async () => {
    if (!name.trim()) {
      alert('请先填写菜品名称');
      return;
    }

    setFetchingIngredients(true);
    try {
      const systemPrompt = `你是一个专业的厨师助手。请根据用户提供的菜品名称，返回制作该菜品所需的食材清单。
返回格式必须是一个包含 ingredients 数组的 JSON 对象，每个食材包含 name 和 quantity 字段。`;
      
      const result = await chatWithAIJson(
        `帮我查询制作${name}所需的食材列表`,
        systemPrompt,
        { temperature: 0.7 }
      );
      
      setIngredients(result.ingredients);
      setShowIngredientsEditor(true);
    } catch (error) {
      console.error('获取食材列表失败:', error);
      alert('获取食材列表失败，请重试');
    } finally {
      setFetchingIngredients(false);
    }
  };

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
            cooking_time_minutes: cookingTime,
            ingredients,
          }
        ]);

      if (error) throw error;
      
      setName('');
      setDescription('');
      setImage('');
      setCookingTime(30);
      setIngredients([]);
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
      </div>
      
      <div className="form-control">
        <div className="flex justify-between items-center">
          <label className="label">
            <span className="label-text">食材清单</span>
          </label>
          <div className="space-x-2">
            {ingredients.length > 0 && (
              <button
                type="button"
                onClick={() => setShowIngredientsEditor(true)}
                className="btn btn-sm btn-outline"
              >
                编辑食材
              </button>
            )}
            <button
              type="button"
              onClick={fetchIngredients}
              disabled={fetchingIngredients || !name.trim()}
              className="btn btn-sm btn-primary"
            >
              {fetchingIngredients ? '获取中...' : '获取食材'}
            </button>
          </div>
        </div>
        {ingredients.length > 0 && (
          <div className="mt-2 p-4 bg-base-200 rounded-lg">
            <div className="max-h-[160px] overflow-y-auto pr-2">
              {ingredients.map((item, index) => (
                <div 
                  key={index} 
                  className="text-sm py-1.5 border-b last:border-0 border-base-300 animate-fade-in"
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-base-content/60 ml-2">{item.quantity}</span>
                </div>
              ))}
            </div>
            {ingredients.length > 5 && (
              <div className="text-xs text-base-content/50 text-center mt-2">
                上下滚动查看更多
              </div>
            )}
          </div>
        )}
      </div>

      {showIngredientsEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card bg-base-100 shadow-lg w-full max-w-lg">
            <div className="card-body">
              <IngredientsEditor
                ingredients={ingredients}
                onSave={(newIngredients) => {
                  setIngredients(newIngredients);
                  setShowIngredientsEditor(false);
                }}
                onCancel={() => setShowIngredientsEditor(false)}
              />
            </div>
          </div>
        </div>
      )}
      
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