import DishList from './DishList';

export default function MainLayout({ userSide }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-base-300">
      {/* 左侧（男生区域） */}
      <div className="flex-1 bg-gradient-to-b from-bili-blue/30 via-bili-blue/20 to-base-300 p-6">
        <div className="max-w-2xl mx-auto">
          <DishList 
            side="male"
            isCurrentUser={userSide === 'male'}
          />
        </div>
      </div>
      
      {/* 右侧（女生区域） */}
      <div className="flex-1 bg-gradient-to-b from-bili-pink/30 via-bili-pink/20 to-base-300 p-6">
        <div className="max-w-2xl mx-auto">
          <DishList 
            side="female"
            isCurrentUser={userSide === 'female'}
          />
        </div>
      </div>
    </div>
  );
} 