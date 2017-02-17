1. 组件只提供事件监听、内容检查；
2. 绑定部分，用枚举完成, 或者用初始化完成;

使用方法:
对某个根元素使用 bindStrategies 方法,
bindStrategies 方法在内部对其中的 input 标签进行选择, 根据 dataset 进行事件的代理和策略的绑定