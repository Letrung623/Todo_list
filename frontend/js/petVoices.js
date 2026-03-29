/**
 * ====================================================================
 * TẬP TIN: petVoices.js (ĐÃ REFACTOR - HỖ TRỢ MULTI VOICE PACKS)
 * MỤC ĐÍCH: Quản lý nhiều "Gói giọng nói" (Voice Packs/Themes) cho thú cưng ảo
 * 
 * ✅ CẤU TRÚC MỚI (ĐA CẤP - SCALABLE):
 * PET_VOICES = {
 *   packName: { actionName: 'Cloudinary_URL' }
 * }
 * 
 * CÁCH GỌI MỚI (2 THAM SỐ):
 * import { PET_VOICES } from './petVoices.js'
 * voiceManager.play('default', 'greeting')  // packName, actionName
 * 
 * HƯỚNG DẪN CHI TIẾT:
 * ========================================
 * (a) THÊM ACTION VÀO PACK CÓ SẴN:
 *    PET_VOICES.default.click = 'https://res.cloudinary.com/.../click.mp3';
 *    
 * (b) THÊM VOICE PACK MỚI HOÀN TOÀN:
 *    PET_VOICES.robot = {
 *      greeting: 'https://.../robot-greeting.mp3',
 *      sad: 'https://.../robot-sad.mp3'
 *    };
 *    
 * 1. Upload mp3 → Cloudinary → Copy public URL
 * 2. Paste vào (a) hoặc (b)
 * 3. Gọi: voiceManager.play('packName', 'actionName')
 * ====================================================================
 */

// 📚 VOICE PACKS STRUCTURE - { packName: { action: 'URL' } }
export const PET_VOICES = {
  // ===== PACK DEFAULT (GIỮ 100% URL GỐC) =====
  default: {
    // Chào hỏi (URL gốc)
    greeting: 'https://res.cloudinary.com/dqm5nlomg/video/upload/v1774454163/n%E1%BA%BFu_kh%C3%B4ng_th%E1%BB%83_l%C3%A0m_ti%E1%BA%BFp_t5yppv.mp3',

    // Task complete high priority (URL gốc)
    taskCompleteHigh: 'https://res.cloudinary.com/dqm5nlomg/video/upload/v1774454177/gioilamcucdang_up_geotgs.mp3',

    // ===== TASK COMPLETE - MAP ƯU TIÊN =====
    // High → taskCompleteHigh | Medium → taskCompleteAverage | Low → taskCompleteEasy
    openning: undefined,
    taskCompleteHigh: 'https://res.cloudinary.com/dqm5nlomg/video/upload/v1774454177/gioilamcucdang_up_geotgs.mp3',
    taskCompleteAverage: 'https://res.cloudinary.com/dqm5nlomg/video/upload/v1774777732/Trungbinh2Cometlamkhong_bcfts7.mp3',
    taskCompleteEasy: 'https://res.cloudinary.com/dqm5nlomg/video/upload/v1774777720/d%E1%BB%851cuthemaphathuy_mwtkkp.mp3'
  },

  // ===== PACK MẪU CUTE (MOCK DATA DEMO) =====
  cute: {
    greeting: 'https://res.cloudinary.com/dqm5nlomg/video/upload/v1774454163/cute-greeting-mock.mp3',
    happy: 'https://res.cloudinary.com/dqm5nlomg/video/upload/v1774454163/cute-happy-mock.mp3',
    excited: 'https://res.cloudinary.com/dqm5nlomg/video/upload/v1774454163/cute-excited-mock.mp3',
    playful: 'https://res.cloudinary.com/dqm5nlomg/video/upload/v1774454163/cute-playful-mock.mp3'
  }
};

/**
 * ACTIONS DANH SÁCH (PACK 'default'):
 * ========================================
 * greeting, taskCompleteHigh, openning
 * taskCompleteEasy, taskCompleteAverage
 * 
 * PACK 'cute': greeting, happy, excited, playful
 * 
 * MAP TASK PRIORITY → VOICE KEY:
 * High → taskCompleteHigh | Medium/Average → taskCompleteAverage | Low/Easy → taskCompleteEasy
 * Gọi: play('default', 'taskCompleteHigh')
 */

