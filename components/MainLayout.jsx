import DishList from './DishList';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

export default function MainLayout({ userSide }) {
  const [wishedDishes, setWishedDishes] = useState([]);
  const [showWishList, setShowWishList] = useState(false);

  // 获取所有被标记为"求投喂"的菜品
  const fetchWishedDishes = async () => {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('wished', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error:', error);
      return;
    }
    setWishedDishes(data);
  };

  // 添加一个新的处理函数来更新本地状态
  const handleWishUpdate = (dishId, isWished) => {
    if (isWished) {
      // 如果是新增到愿望清单，先从数据库获取完整的菜品信息
      supabase
        .from('dishes')
        .select('*')
        .eq('id', dishId)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setWishedDishes(prev => [...prev, data]);
          }
        });
    } else {
      // 如果是从愿望清单移除，直接更新本地状态
      setWishedDishes(prev => prev.filter(dish => dish.id !== dishId));
    }
  };

  useEffect(() => {
    fetchWishedDishes();
    
    // 订阅数据库变化
    const channel = supabase
      .channel('wished-dishes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'dishes' }, 
        () => {
          fetchWishedDishes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-base-300">
      {/* 左侧（男生区域） */}
      <div className="flex-1 bg-gradient-to-b from-bili-blue/30 via-bili-blue/20 to-base-300 p-6">
        <div className="max-w-2xl mx-auto">
          <DishList 
            side="male"
            isCurrentUser={userSide === 'male'}
            onWishUpdate={handleWishUpdate}
          />
        </div>
      </div>
      
      {/* 右侧（女生区域） */}
      <div className="flex-1 bg-gradient-to-b from-bili-pink/30 via-bili-pink/20 to-base-300 p-6">
        <div className="max-w-2xl mx-auto">
          <DishList 
            side="female"
            isCurrentUser={userSide === 'female'}
            onWishUpdate={handleWishUpdate}
          />
        </div>
      </div>

      {/* 新增的浮动投喂清单 */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {showWishList && wishedDishes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full right-0 mb-4 w-80 bg-base-100 rounded-lg shadow-xl"
            >
              <div className="p-4">
                <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                  投喂清单
                  <span className="text-sm font-normal text-base-content/60">
                    共 {wishedDishes.length} 道菜
                  </span>
                </h3>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {wishedDishes.map(dish => (
                    <div 
                      key={dish.id}
                      className={`p-3 rounded-lg flex items-center gap-3 ${
                        dish.created_by === 'male' ? 'bg-bili-blue/10' : 'bg-bili-pink/10'
                      }`}
                    >
                      {dish.image_url && (
                        <img 
                          src={dish.image_url} 
                          alt={dish.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{dish.name}</h4>
                        {dish.cooking_time_minutes && (
                          <p className="text-sm text-base-content/60">
                            预计 {dish.cooking_time_minutes} 分钟
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowWishList(!showWishList)}
          className={`btn btn-circle btn-lg shadow-lg hover:shadow-xl
            ${wishedDishes.length > 0 ? 'btn-primary animate-bounce' : 'btn-ghost'}
            transition-all duration-300`}
        >
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
            </svg>
            {wishedDishes.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-error text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                {wishedDishes.length}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
} 