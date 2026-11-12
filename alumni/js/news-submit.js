(function () {
  'use strict';

  const U = AlumniUI;
  const celebratory = ['MARRIAGE', 'BIRTH_SON', 'BIRTH_DAUGHTER', 'OBITUARY'];
  let auth = null;

  function updateType() {
    const type = U.qs('[name="news_type"]').value;
    U.qsa('.news-conditional').forEach(el => {
      el.hidden = !el.dataset.types.split(' ').includes(type);
    });
    U.qs('[name="mail_requested"]').checked = celebratory.includes(type);
    U.qs('#event-date-label').textContent =
      type === 'MARRIAGE' ? '결혼일' :
      type.startsWith('BIRTH_') ? '출산일' :
      type === 'OBITUARY' ? '발인일' : '관련 날짜';
    U.qs('#location-label').textContent = type === 'OBITUARY' ? '빈소·장지' : '장소';
  }

  async function initializeAuthor() {
    const status = U.qs('#news-submit-status');
    U.status(status, '작성 권한 확인 중…');
    try {
      await window.alumniPortalReady;
      if (document.documentElement.dataset.alumniPortalAuth !== 'approved') {
        throw new Error('승인된 포털 계정으로 로그인해 주세요.');
      }
      // The API derives and authorizes the Alumni ID from the signed-in session.
      // Do not ask for an ID or trust an identifier supplied by the browser.
      const verified = await AlumniAPI.request('verifyNewsAlumni', {
        method: 'POST',
        data: {}
      });
      const alumniId = String(verified.data?.alumni_id || '').trim();
      if (!alumniId) throw new Error('포털 계정에 연결된 졸업생 정보를 찾을 수 없습니다.');
      auth = { alumni_id: alumniId };
      U.qs('#news-submit-form').hidden = false;
      status.hidden = true;
    } catch (error) {
      auth = null;
      U.qs('#news-submit-form').hidden = true;
      U.status(status, error?.message || '작성자 확인에 실패했습니다.', 'error');
    }
  }

  async function searchTarget() {
    if (!auth) return;
    const query = U.qs('#target-query').value.trim();
    try {
      const response = await AlumniAPI.request('newsAlumniSearch', {
        method: 'POST',
        data: { alumni_id: auth.alumni_id, query }
      });
      U.qs('#target-results').innerHTML = (response.data || []).map(x =>
        `<button class="news-target" type="button" data-target-id="${U.esc(x.alumni_id)}">` +
        `<strong>${U.esc(x.name)} · ${U.esc(x.graduation_year)}년</strong><br>` +
        `${U.esc([x.company, x.job].filter(Boolean).join(' · ') || '공개 경력정보 없음')}</button>`
      ).join('') || '<p class="hint">검색 결과가 없습니다.</p>';
    } catch (error) {
      U.status(U.qs('#news-submit-status'), error.message, 'error');
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (!auth) {
      U.status(U.qs('#news-submit-status'), '포털 계정 확인 후 등록할 수 있습니다.', 'error');
      return;
    }
    const form = event.currentTarget;
    const button = U.qs('#news-submit-button');
    const data = Object.fromEntries(new FormData(form));
    data.mail_requested = U.qs('[name="mail_requested"]').checked;
    U.busy(button, true, '등록 중…');
    try {
      // Server checks ownership again; the browser never accepts a manual Alumni ID.
      const result = await AlumniAPI.request('submitNews', {
        method: 'POST',
        data: { ...data, alumni_id: auth.alumni_id }
      });
      U.status(U.qs('#news-submit-status'), result.message, 'success');
      form.reset();
      form.hidden = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      U.status(U.qs('#news-submit-status'), error.message, 'error');
    } finally {
      U.busy(button, false);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    U.qs('[name="news_type"]').addEventListener('change', updateType);
    U.qs('#target-search').addEventListener('click', searchTarget);
    U.qs('[name="relationship"]').addEventListener('change', event => {
      U.qs('[name="relationship_other"]').hidden = event.target.value !== '기타';
    });
    U.qs('#target-results').addEventListener('click', event => {
      const button = event.target.closest('[data-target-id]');
      if (!button) return;
      U.qs('[name="target_alumni_id"]').value = button.dataset.targetId;
      U.qsa('.news-target').forEach(el => el.classList.toggle('is-selected', el === button));
    });
    U.qs('#news-submit-form').addEventListener('submit', submit);
    initializeAuthor();
  });
})();
