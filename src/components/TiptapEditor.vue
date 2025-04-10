<template>
  <editor-content :editor="editor" />
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

const props = defineProps({
  modelValue: String
});

const emits = defineEmits(['update:modelValue']);

const editor = useEditor({
  extensions: [
    StarterKit,
  ],
  content: props.modelValue,
  onUpdate: ({ editor }) => {
    emits('update:modelValue', editor.getHTML());
  }
});

onUnmounted(() => {
  editor.value.destroy();
});
</script>
