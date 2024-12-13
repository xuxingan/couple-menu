import DishList from './DishList';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { chatWithAIJson } from '../utils/aiClient';

export default function MainLayout({ userSide }) {
  const [wishedDishes, setWishedDishes] = useState([]);
  const [showWishList, setShowWishList] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [shoppingList, setShoppingList] = useState(null);
  const [generatingList, setGeneratingList] = useState(false);
  const [editableShoppingList, setEditableShoppingList] = useState(null);
  const [hasGeneratedList, setHasGeneratedList] = useState(false);
  const [currentShoppingListId, setCurrentShoppingListId] = useState(null);

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

  // 生成采买清单ID的函数
  const generateShoppingListId = (dishes) => {
    // 1. 提取所有菜品ID并排序
    const sortedIds = dishes
      .map(dish => dish.id)
      .sort()
      .join('|');
    
    // 2. 使用简单的哈希函数（可以根据需要选择其他哈希算法）
    let hash = 0;
    for (let i = 0; i < sortedIds.length; i++) {
      const char = sortedIds.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // 3. 转换为16进制字符串并保证唯一性
    return `sl_${Math.abs(hash).toString(16)}`;
  };

  // 修改保存函数
  const saveShoppingList = async () => {
    try {
      const listId = generateShoppingListId(wishedDishes);
      const dishIds = wishedDishes.map(dish => dish.id);

      const { data, error } = await supabase
        .from('shopping_lists')
        .upsert({ 
          id: listId,
          dish_ids: dishIds,
          content: editableShoppingList,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
      setCurrentShoppingListId(listId);
      setShoppingList(editableShoppingList);
      setShowShoppingList(false);
    } catch (error) {
      console.error('保存采买清单失败:', error);
      alert('保存失败，请重试');
    }
  };

  // 获取采买清单时，先检查是否存在对应的清单
  const fetchShoppingList = async (dishes) => {
    if (!dishes.length) return null;
    
    const listId = generateShoppingListId(dishes);
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('id', listId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // 没有找到记录
        return null;
      }
      throw error;
    }

    return data;
  };

  // 修改生成清单的函数
  const generateShoppingList = async () => {
    setGeneratingList(true);
    try {
      // 先检查是否已经存在对应的清单
      const existingList = await fetchShoppingList(wishedDishes);
      if (existingList) {
        setShoppingList(existingList.content);
        setEditableShoppingList(existingList.content);
        setCurrentShoppingListId(existingList.id);
        setShowShoppingList(true);
        setHasGeneratedList(true);
        return;
      }

      // 如果不存在，则生成新的清单
      // 收集所有菜品的食材列表
      const allIngredients = wishedDishes
        .filter(dish => dish.ingredients)
        .map((dish, index) => `列表${index + 1}: ${JSON.stringify(dish.ingredients)}`);

      if (allIngredients.length === 0) {
        alert('没有找到任何食材信息！');
        return;
      }

      const systemPrompt = `你是一个智能助手，专门用于处理食材列表的语义分组任务。
请确保返回的JSON格式正确，且每个食材都被正确分类到以下类别之一：调味料、香料、肉类、蔬菜、其他。`;

      const userPrompt = `请按照以下步骤操作：
1. 合并以下所有食材列表：
${allIngredients.join('\n')}

2. 根据食材的语义相似性，将合并后的食材列表分类并返回JSON格式，格式如下：
{
  "groups": [
    {
      "category": "类别名称",
      "ingredients": [
        {
          "name": "食材名称",
          "quantity": "食材数量"
        }
      ]
    }
  ]
}`;

      const result = await chatWithAIJson(userPrompt, systemPrompt);
      setShoppingList(result);
      setEditableShoppingList(result);
      setShowShoppingList(true);
      setHasGeneratedList(true);

      // 生成新清单后立即保存到数据库
      const listId = generateShoppingListId(wishedDishes);
      const dishIds = wishedDishes.map(dish => dish.id);
      const { error } = await supabase
        .from('shopping_lists')
        .upsert({ 
          id: listId,
          dish_ids: dishIds,
          content: result,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
      setCurrentShoppingListId(listId);

    } catch (error) {
      console.error('生成采买清单失败:', error);
      alert('生成采买清单失败，请重试');
    } finally {
      setGeneratingList(false);
    }
  };

  const addIngredient = (groupIndex) => {
    const newList = { ...editableShoppingList };
    newList.groups[groupIndex].ingredients.push({ name: '', quantity: '' });
    setEditableShoppingList(newList);
  };

  const removeIngredient = (groupIndex, ingredientIndex) => {
    const newList = { ...editableShoppingList };
    newList.groups[groupIndex].ingredients.splice(ingredientIndex, 1);
    setEditableShoppingList(newList);
  };

  const updateIngredient = (groupIndex, ingredientIndex, field, value) => {
    const newList = { ...editableShoppingList };
    newList.groups[groupIndex].ingredients[ingredientIndex][field] = value;
    setEditableShoppingList(newList);
  };

  const cancelEditing = () => {
    setEditableShoppingList(shoppingList);
    setShowShoppingList(false);
  };

  useEffect(() => {
    fetchWishedDishes();
    
    // 订阅数据库变化
    const channel = supabase
      .channel('all-changes')
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
  }, []); // 只在组件挂载时执行

  useEffect(() => {
    const checkShoppingList = async () => {
      try {
        const existingList = await fetchShoppingList(wishedDishes);
        if (existingList) {
          // 如果找到匹配的清单，更新状态
          setShoppingList(existingList.content);
          setEditableShoppingList(existingList.content);
          setCurrentShoppingListId(existingList.id);
          setHasGeneratedList(true);
        } else {
          // 如果没有找到匹配的清单，重置状态
          setShoppingList(null);
          setEditableShoppingList(null);
          setCurrentShoppingListId(null);
          setHasGeneratedList(false);
        }
      } catch (error) {
        console.error('检查采买清单失败:', error);
      }
    };

    if (wishedDishes.length > 0) {
      checkShoppingList();
    } else {
      // 如果愿望清单为空，重置所有相关状态
      setShoppingList(null);
      setEditableShoppingList(null);
      setCurrentShoppingListId(null);
      setHasGeneratedList(false);
    }
  }, [wishedDishes]); // 依赖 wishedDishes 整个数组

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

      {/* 浮动投喂清单 */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {showWishList && wishedDishes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full right-0 mb-4 w-96 bg-base-100 rounded-lg shadow-xl"
            >
              <div className="p-4">
                <h3 className="text-lg font-bold mb-4 flex items-center justify-between gap-4">
                  <span>投喂清单</span>
                  <div className="flex gap-2 items-center shrink-0">
                    {hasGeneratedList && (
                      <button
                        onClick={() => {
                          setEditableShoppingList(shoppingList);
                          setShowShoppingList(true);
                        }}
                        className="btn btn-sm btn-ghost"
                      >
                        编辑清单
                      </button>
                    )}
                    <button
                      onClick={generateShoppingList}
                      disabled={generatingList}
                      className="btn btn-sm btn-primary"
                    >
                      {generatingList ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : hasGeneratedList ? (
                        '重新生成'
                      ) : (
                        '生成采买清单'
                      )}
                    </button>
                    <span className="text-sm font-normal text-base-content/60 whitespace-nowrap">
                      共 {wishedDishes.length} 道菜
                    </span>
                  </div>
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
                            预 {dish.cooking_time_minutes} 分钟
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

        {/* 采买清单弹窗 */}
        <AnimatePresence>
          {showShoppingList && editableShoppingList && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col"
              >
                <div className="p-6 flex flex-col flex-1 min-h-0">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">采买清单</h3>
                    <button 
                      onClick={() => setShowShoppingList(false)}
                      className="btn btn-circle btn-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                    {editableShoppingList.groups.map((group, groupIndex) => (
                      <div key={groupIndex} className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-bold">{group.category}</h4>
                          <button
                            onClick={() => addIngredient(groupIndex)}
                            className="btn btn-circle btn-sm btn-ghost"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-2">
                          <AnimatePresence>
                            {group.ingredients.map((ingredient, ingredientIndex) => (
                              <motion.div
                                key={ingredientIndex}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="flex items-center gap-2 p-3 bg-base-200 rounded-lg group"
                              >
                                <input
                                  type="text"
                                  value={ingredient.name}
                                  onChange={(e) => updateIngredient(groupIndex, ingredientIndex, 'name', e.target.value)}
                                  placeholder="食材名称"
                                  className="input input-sm input-bordered flex-1 bg-base-100"
                                />
                                <input
                                  type="text"
                                  value={ingredient.quantity}
                                  onChange={(e) => updateIngredient(groupIndex, ingredientIndex, 'quantity', e.target.value)}
                                  placeholder="用量"
                                  className="input input-sm input-bordered w-32 bg-base-100"
                                />
                                <button
                                  onClick={() => removeIngredient(groupIndex, ingredientIndex)}
                                  className="btn btn-circle btn-sm btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-base-300 flex justify-end gap-2 bg-base-100">
                    <button
                      onClick={cancelEditing}
                      className="btn btn-ghost"
                    >
                      取消
                    </button>
                    <button
                      onClick={saveShoppingList}
                      className="btn btn-primary"
                    >
                      保存
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
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