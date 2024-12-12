import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IngredientsEditor({ ingredients, onSave, onCancel }) {
  const [items, setItems] = useState(ingredients || []);

  const addIngredient = () => {
    setItems([...items, { name: '', quantity: '' }]);
  };

  const removeIngredient = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateIngredient = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">食材清单</h3>
      </div>
      
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex gap-2 items-center bg-base-200 p-2 rounded-lg group"
            >
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                placeholder="食材名称"
                className="input input-sm input-bordered flex-1 bg-base-100"
              />
              <input
                type="text"
                value={item.quantity}
                onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                placeholder="用量"
                className="input input-sm input-bordered w-32 bg-base-100"
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="btn btn-circle btn-sm btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        <button
          type="button"
          onClick={addIngredient}
          className="btn btn-sm btn-outline w-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          添加食材
        </button>
      </div>

      <div className="flex gap-4 pt-4 border-t border-base-300">
        <button onClick={onCancel} className="btn flex-1">
          取消
        </button>
        <button 
          onClick={() => onSave(items)}
          className="btn btn-primary flex-1"
          disabled={items.some(item => !item.name || !item.quantity)}
        >
          确定
        </button>
      </div>
    </motion.div>
  );
} 