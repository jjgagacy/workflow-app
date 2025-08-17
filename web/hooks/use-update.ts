import { useCallback, useState } from "react"

// 强制组件重新渲染
export const useUpdate = () => {
    // 创建一个不存储实际状态的状态变量
    const [, setState] = useState();
    return useCallback(() => { // 传入一个函数而非直接值，确保每次调用都触发更新
        setState(() => {
            return undefined;
        })
    }, []); // 空依赖数组 [] 确保函数在组件生命周期内保持稳定引用
}

/**
 * 使用场景
 function MyComponent() {
  const update = useUpdate();
  
  return (
    <div>
      <div>上次更新时间: {new Date().toLocaleTimeString()}</div>
      <button onClick={update}>强制更新</button>
    </div>
  );
}
 */