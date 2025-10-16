    async function getImagesFromDirectory(directoryPath, options = {}) {
        const {
            extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
            returnFullUrl = true
        } = options;
        
        try {
            // 构建完整的目录URL
            const directoryUrl = directoryPath.startsWith('http') 
                ? directoryPath 
                : `${imgUrl}/${directoryPath.replace(/^\//, '')}`;
            
            // 确保URL以/结尾344
            const normalizedUrl = directoryUrl.endsWith('/') ? directoryUrl : directoryUrl + '/';
            
            const response = await fetch(normalizedUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(html, 'text/html');
            
            // 构建选择器，支持多种图片格式
            const selectors = extensions.flatMap(ext => [
                `a[href$=".${ext}"]`,
                `a[href$=".${ext.toUpperCase()}"]`
            ]).join(', ');
            
            const imageLinks = htmlDoc.querySelectorAll(selectors);
            const images = Array.from(imageLinks).map(link => {
                const href = link.getAttribute('href');
                if (returnFullUrl) {
                    return new URL(href, normalizedUrl).href;
                } else {
                    return href;
                }
            });
            
            return images;
        } catch (error) {
            console.error(`获取目录 ${directoryPath} 中的图片失败:`, error);
            return [];
        }
    }
    