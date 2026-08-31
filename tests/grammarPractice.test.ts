import { describe, it, expect } from 'vitest';
import { grammarLessons } from '../src/content/grammar';
import { editingItems, ruleTeachings, editingItemsFor, teachingFor } from '../src/content/grammarPractice';

const lessonIds = new Set(grammarLessons.map((l) => l.id));

describe('grammar practice content', () => {
  it('should attach every item to a real grammar lesson', () => {
    editingItems.forEach((item) => expect(lessonIds.has(item.lessonId), item.lessonId).toBe(true));
    ruleTeachings.forEach((t) => expect(lessonIds.has(t.lessonId), t.lessonId).toBe(true));
  });

  it('should contain the wrong word exactly once in each sentence', () => {
    editingItems.forEach((item) => {
      const words = item.sentence.split(' ').map((w) => w.replace(/[.,!?;:]+$/, ''));
      const target = item.wrong.replace(/[.,!?;:]+$/, '');
      const hits = words.filter((w) => w === target).length;
      expect(hits, `${item.lessonId}: "${item.wrong}" in "${item.sentence}"`).toBe(1);
    });
  });

  it('should offer the correct answer among the options, and never the wrong word', () => {
    editingItems.forEach((item) => {
      expect(item.options, item.sentence).toContain(item.correct);
      expect(item.options.length, item.sentence).toBe(3);
      expect(new Set(item.options).size, `duplicate options: ${item.sentence}`).toBe(3);
      expect(item.options, `${item.sentence} offers the mistake as a choice`).not.toContain(item.wrong);
    });
  });

  it('should explain why, in words a child can read', () => {
    editingItems.forEach((item) => {
      const count = item.why.trim().split(/\s+/).length;
      expect(count, `${item.lessonId}: "${item.why}"`).toBeGreaterThanOrEqual(5);
      expect(count, `${item.lessonId}: "${item.why}"`).toBeLessThanOrEqual(16);
      expect(item.why.endsWith('.'), item.why).toBe(true);
    });
  });

  it('should use British spelling in sentences and explanations', () => {
    const american = /\b(color|colors|favorite|honor|neighbor|practicing|realize|organize|traveling|mom|math)\b/i;
    editingItems.forEach((item) => {
      expect(american.test(item.sentence), item.sentence).toBe(false);
      expect(american.test(item.why), item.why).toBe(false);
    });
  });

  it('should give every rule that has drills a worked teaching too', () => {
    const drilled = new Set(editingItems.map((i) => i.lessonId));
    drilled.forEach((id) => {
      const teaching = teachingFor(id);
      expect(teaching, `no teaching for ${id}`).toBeTruthy();
      expect(teaching!.steps.length).toBeGreaterThanOrEqual(2);
      teaching!.steps.forEach((s) => {
        expect(s.show.length).toBeGreaterThan(0);
        expect(s.explain.length).toBeGreaterThan(10);
      });
      expect(teaching!.tip.length).toBeGreaterThan(10);
    });
  });

  it('should give each covered rule at least three sentences to fix', () => {
    const drilled = new Set(editingItems.map((i) => i.lessonId));
    drilled.forEach((id) => expect(editingItemsFor(id).length, id).toBeGreaterThanOrEqual(3));
  });
});
