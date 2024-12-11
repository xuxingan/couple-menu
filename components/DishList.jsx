import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import AddDishForm from './AddDishForm';
import EditDishForm from './EditDishForm';

export default function DishList({ side, isCurrentUser }) {
  const [dishes, setDishes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('created_by', side)
      .order('wished', { ascending: false })  // 先按照求投喂状态排序
      .order('created_at', { ascending: false });  // 再按时间排序
      
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    setDishes(data);
  };

  const toggleWish = async (dishId, currentWished) => {
    const { error } = await supabase
      .from('dishes')
      .update({ wished: !currentWished })
      .eq('id', dishId);

    if (error) {
      console.error('Error:', error);
      return;
    }

    // 更新本地状态
    fetchDishes();
  };

  const handleDishClick = (dish) => {
    if (isCurrentUser) {
      setEditingDish(dish);
    }
  };

  return (
    <div className="space-y-6 relative pt-16">
      <div className={`absolute top-0 ${
        side === 'male' ? 'left-0' : 'right-0'
      }`}>
        {isCurrentUser && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`btn btn-circle btn-lg ${
              side === 'male' 
                ? 'bg-bili-blue hover:bg-bili-blue/80' 
                : 'bg-bili-pink hover:bg-bili-pink/80'
            } border-0 shadow-lg hover:shadow-xl transform hover:scale-110 
            transition-all duration-300 group relative`}
          >
            {showAddForm ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
              </svg>
            )}
          </button>
        )}
      </div>
      
      {showAddForm && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <AddDishForm
              side={side}
              onSuccess={() => {
                setShowAddForm(false);
                fetchDishes();
              }}
            />
          </div>
        </div>
      )}

      {editingDish && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card bg-base-100 shadow-lg w-full max-w-lg">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">修改菜品</h3>
                <button 
                  onClick={() => setEditingDish(null)}
                  className="btn btn-circle btn-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <EditDishForm
                dish={editingDish}
                onSuccess={() => {
                  setEditingDish(null);
                  fetchDishes();
                }}
                onCancel={() => setEditingDish(null)}
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        {dishes.map((dish) => (
          <div 
            key={dish.id}
            onClick={() => handleDishClick(dish)}
            className={`relative h-80 group rounded-xl overflow-hidden transform hover:scale-[1.02] 
              transition-all duration-300 hover:shadow-2xl cursor-pointer
              ${dish.wished ? 'ring-4 ring-offset-4 ring-offset-base-300 ' + 
                (side === 'male' ? 'ring-bili-blue' : 'ring-bili-pink') : ''}`}
          >
            {/* 背景图片 */}
            <div className="absolute inset-0">
              {dish.image_url ? (
                <img
                  src={dish.image_url}
                  alt={dish.name}
                  className={`w-full h-full object-cover transform 
                    group-hover:scale-110 transition-transform duration-700 ease-in-out
                    ${dish.wished ? 'brightness-110' : ''}`}
                />
              ) : (
                <div className="w-full h-full bg-base-200" />
              )}
              {/* 渐变遮罩 */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent 
                opacity-80 group-hover:opacity-70 transition-opacity duration-300
                ${dish.wished ? 'opacity-60' : ''}`} />
            </div>

            {/* 内容 */}
            <div className="relative h-full p-6 flex flex-col justify-end transform 
              translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <div className="space-y-2">
                <h3 className={`text-2xl font-bold text-white group-hover:text-bili-blue
                  transform group-hover:-translate-y-1 transition-all duration-300
                  ${dish.wished ? 'animate-pulse' : ''}`}>
                  {dish.name}
                  {dish.wished && (
                    <span className="ml-2 text-sm animate-bounce inline-block">
                      ✨ 期待被投喂
                    </span>
                  )}
                </h3>
                {dish.description && (
                  <p className="text-gray-200 group-hover:text-white transition-colors
                    duration-300 transform translate-y-2 opacity-0 group-hover:opacity-100 
                    group-hover:translate-y-0">
                    {dish.description}
                  </p>
                )}
                {!isCurrentUser && (
                  <div className="pt-4 transform translate-y-4 opacity-0 
                    group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <button 
                      onClick={() => toggleWish(dish.id, dish.wished)}
                      className={`btn btn-sm ${
                        side === 'male' 
                          ? 'btn-primary animate-pulse hover:animate-none' 
                          : 'btn-secondary animate-pulse hover:animate-none'
                      } ${dish.wished ? 'btn-outline' : ''}`}
                    >
                      {dish.wished ? '取消期待 💔' : '(˘•ω•˘)求投喂 ❤️'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 