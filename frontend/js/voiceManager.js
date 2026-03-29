/**
 * ====================================================================
 * TẬP TIN: voiceManager.js
 * MỤC ĐÍCH: Quản lý phát âm thanh cho nhân vật thú cưng
 * 
 * TÍNH NĂNG:
 * ✓ Phát âm thanh theo tên hành động (action name)
 * ✓ Ngăn chặn phát chồng chéo (không cho 2 âm thanh phát cùng lúc)
 * ✓ Kiểm tra URL hợp lệ trước khi phát
 * ✓ Xử lý lỗi gracefully (một cách lịch sự)
 * ✓ Kiểm soát âm lượng (volume)
 * 
 * CÁCH DÙNG:
 * ========================================
 * import { VoiceManager } from './voiceManager.js'
 * import { PET_VOICES } from './petVoices.js'
 * 
 * const voiceManager = new VoiceManager(PET_VOICES)
 * voiceManager.play('greeting')
 * voiceManager.setVolume(0.8)
 * voiceManager.stop()
 * ====================================================================
 */

export class VoiceManager {
  /**
   * Constructor - Hàm tạo
   * @param {Object} voicesDict - Nested dict { packName: { actionName: 'URL' } }
   */
  constructor(voicesDict = {}) {
    // 📚 LƯU TRỮ DICTIONARY CÁC GIỌNG NÓI
    this.voicesDict = voicesDict;

    // 🎵 ELEMENT AUDIO ĐANG PHÁT HIỆN TẠI
    this.currentAudio = null;

    // 🔊 ÂM LƯỢNG MẶC ĐỊNH (0.7 = 70%)
    this.volume = 0.7;

    // ✅ CỜ: CÓ PHỤ ÂM THANH HAY KHÔNG (true = phát, false = không phát)
    this.isEnabled = true;

    // 📞 HÀNG ĐỢI ÂM THANH (lưu những âm thanh chưa được phát)
    this.queue = [];

    // 🐛 CHẾ ĐỘ DEBUG (hiển thị log chi tiết)
    this.debug = true;

    // In thông báo khởi tạo thành công
    this.log('🎵 VoiceManager đã được khởi tạo thành công');
  }

  /**
   * PHÁT ÂM THANH
   * @param {string} actionName - Tên hành động (key trong voicesDict)
   * @param {Object} options - Tùy chọn { volume, interrupt, queue }
   * 
   * Tùy chọn:
   * - volume: số từ 0 đến 1 (ghi đè volume mặc định)
   * - interrupt: đúng = ngắt âm thanh cũ, sai = bỏ qua nếu đang phát
   * - queue: đúng = thêm vào hàng đợi nếu đang phát, sai = bỏ qua
   */
  play(packName, actionName, options = {}) {
    // ❌ KIỂM TRA: Âm thanh có được bật không
    if (!this.isEnabled) {
      this.log('🔇 Âm thanh đã bị tắt, bỏ qua yêu cầu phát');
      return false;
    }

    // LẤY URL TỪ NESTED DICTIONARY: voicesDict[packName][actionName]
    const voiceUrl = this.voicesDict[packName]?.[actionName];

    // ❌ KIỂM TRA: Pack hoặc action không tồn tại
    if (!voiceUrl) {
      console.warn(`⚠️ Không tìm thấy: pack="${packName}", action="${actionName}"`);
      this.log(`Packs có sẵn: ${Object.keys(this.voicesDict).join(', ')}`);
      return false;
    }

    // ❌ KIỂM TRA: URL có hợp lệ không
    if (!this.isValidUrl(voiceUrl)) {
      console.warn(`❌ URL không hợp lệ cho "${actionName}": ${voiceUrl}`);
      return false;
    }

    // TRÍCH XUẤT CÁC TUỲ CHỌN TỪ THAM SỐ
    const {
      volume = this.volume,
      interrupt = true,
      queue = false
    } = options;

    // ========== NẾU ĐANG PHÁT ÂM THANH ==========
    if (this.currentAudio && !this.currentAudio.ended) {
      if (interrupt) {
        // 🔄 NGẮT ÂM THANH CŨ VÀ PHÁT CÁI MỚI
        this.log(`🔄 Ngắt âm thanh đang phát để phát "${actionName}"`);
        this.stop();
      } else if (queue) {
        // ⏳ THÊM VÀO HÀNG ĐỢI ĐỂ PHÁT SAU
        this.log(`⏳ Đã thêm "${actionName}" vào hàng đợi`);
        this.queue.push({ packName, actionName, volume });
        return true;
      } else {
        // ⏭️ BỎ QUA YÊU CẦU NÀY
        this.log(`⏭️ Bỏ qua "${packName}/${actionName}" - đang có âm thanh khác phát`);
        return false;
      }
    }

    // ========== PHÁT ÂM THANH ==========
    try {
      // TẠO ELEMENT AUDIO MỚI
      const audio = new Audio(voiceUrl);

      // ĐẶT ÂM LƯỢNG (đảm bảo nằm trong khoảng 0-1)
      audio.volume = Math.max(0, Math.min(1, volume));

      // GẮN EVENT LISTENERS (lắng nghe khi âm thanh kết thúc hoặc lỗi)
      audio.addEventListener('ended', () => this.onAudioEnded());
      audio.addEventListener('error', (e) => this.onAudioError(e, `${packName}/${actionName}`));

      // LƯU AUDIO HIỆN TẠI VÀ PHÁT
      this.currentAudio = audio;
      audio.play();

      this.log(`✅ Đang phát "${actionName}" với âm lượng ${audio.volume.toFixed(1)}`);
      return true;

    } catch (error) {
      console.error(`❌ Lỗi khi phát âm thanh: ${error.message}`);
      return false;
    }
  }

  /**
   * SỰ KIỆN KHI ÂM THANH KẾT THÚC
   * - Kiểm tra hàng đợi có âm thanh nào chưa phát không
   * - Nếu có thì phát âm thanh tiếp theo
   */
  onAudioEnded() {
    this.log('✅ Âm thanh đã kết thúc');

    // KIỂM TRA HÀNG ĐỢI
    if (this.queue.length > 0) {
      // LẤY ÂM THANH TIẾP THEO TỪ HÀNG ĐỢI
      const nextItem = this.queue.shift();
      this.log(`📢 Đang phát âm thanh tiếp theo: ${nextItem.packName}/${nextItem.actionName}`);

      // CHỜ MỘT CHÚT RỒI PHÁT
      setTimeout(() => {
        this.play(nextItem.packName, nextItem.actionName, { volume: nextItem.volume });
      }, 100);
    }
  }

  /**
   * SỰ KIỆN KHI PHÁT ÂM THANH CÓ LỖI
   * @param {Event} error - Sự kiện lỗi
   * @param {string} actionName - Tên hành động
   */
  onAudioError(error, actionKey) {
    console.error(`⚠️ Lỗi âm thanh với "${actionKey}":`, error.message);
    this.log(`Mã lỗi: ${this.currentAudio?.error?.code}`);

    // TIẾP TỤC VỚI HÀNG ĐỢI DỮ LỖI XẢY RA
    if (this.queue.length > 0) {
      const nextItem = this.queue.shift();
      setTimeout(() => {
        this.play(nextItem.actionName, { volume: nextItem.volume });
      }, 500);
    }
  }

  /**
   * DỪNG PHÁT ÂM THANH
   * - Tạm dừng audio hiện tại
   * - Trả lại vị trí về 0
   */
  stop() {
    if (this.currentAudio && !this.currentAudio.ended) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.log('⏹️ Đã dừng âm thanh');
      return true;
    }
    return false;
  }

  /**
   * ĐẶT ÂM LƯỢNG
   * @param {number} volumeValue - Giá trị từ 0 đến 1
   */
  setVolume(volumeValue) {
    // ĐẢM BẢO VOLUME NẰM TRONG KHOẢNG 0-1
    this.volume = Math.max(0, Math.min(1, volumeValue));

    // CẬP NHẬT ÂM LƯỢNG AUDIO ĐANG PHÁT
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }

    this.log(`🔊 Âm lượng được đặt thành ${(this.volume * 100).toFixed(0)}%`);
  }

  /**
   * BẬT/TẮT ÂM THANH
   * @param {boolean} enabled - true = bật, false = tắt
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;

    // NẾU TẮT âm thanh, hãy dừng phát hiện tại
    if (!enabled) {
      this.stop();
    }

    this.log(`🔔 Âm thanh đã ${enabled ? 'bật' : 'tắt'}`);
  }

  /**
   * KIỂM TRA URL CÓ HỢP LỆ KHÔNG
   * @param {string} url - URL cần kiểm tra
   * @returns {boolean} true nếu URL hợp lệ (https hoặc http)
   */
  isValidUrl(url) {
    try {
      // TRY PARSE URL
      const urlObj = new URL(url);

      // CHỈ CHẤP NHẬN HTTPS HOẶC HTTP
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * CẬP NHẬT DICTIONARY GIỌNG NÓI
   * @param {Object} newVoices - Object mới với { tên_hành_động: 'URL' }
   */
  updateVoices(newVoices) {
    // HỢP NHẤT DICTIONARY CŨ VÀ CÁI MỚI
    this.voicesDict = { ...this.voicesDict, ...newVoices };
    this.log(`📝 Cập nhật giọng nói. Tổng số hành động: ${Object.keys(this.voicesDict).length}`);
  }

  /**
   * LẤY DANH SÁCH TẤT CẢ HÀNH ĐỘNG CÓ SẲN
   * @returns {string[]} Array của tất cả tên hành động
   */
  getAvailableActions() {
    return Object.keys(this.voicesDict);
  }

  /**
   * XÓA HÀng đợi (xoá tất cả âm thanh chưa phát)
   */
  clearQueue() {
    const queueSize = this.queue.length;
    this.queue = [];
    this.log(`🧹 Đã xoá ${queueSize} mục từ hàng đợi`);
  }

  /**
   * IN LOG THÔNG TIN (chỉ khi ở chế độ debug)
   * @param {string} message - Thông báo cần in
   */
  log(message) {
    if (this.debug) {
      console.log(`[VoiceManager] ${message}`);
    }
  }

  /**
   * LẤY THỐNG KÊ HỆ THỐNG
   * @returns {Object} Các thông tin về trạng thái hiện tại
   */
  getStats() {
    return {
      isEnabled: this.isEnabled,
      currentVolume: this.volume,
      isPlaying: this.currentAudio && !this.currentAudio.ended,
      queueLength: this.queue.length,
      totalActions: Object.keys(this.voicesDict).length,
    };
  }
}

/**
 * VÍ DỤ NHANH KHỞI ĐỘNG
 * ========================================
 * import { VoiceManager } from './voiceManager.js'
 * import { PET_VOICES } from './petVoices.js'
 * 
 * // Khởi tạo
 * window.voiceManager = new VoiceManager(PET_VOICES)
 * 
 * // Phát âm thanh
 * voiceManager.play('greeting')
 * 
 * // Phát với tùy chọn
 * voiceManager.play('angry', {
 *   volume: 0.5,
 *   interrupt: true
 * })
 * 
 * // Đặt âm lượng toàn cục
 * voiceManager.setVolume(0.8)
 * 
 * // Tắt/bật âm thanh
 * voiceManager.setEnabled(false)
 * 
 * // Xem thống kê
 * console.log(voiceManager.getStats())
 */
