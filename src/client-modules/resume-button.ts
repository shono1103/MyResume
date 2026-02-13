import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  // Wait for the navbar to be available
  const addResumeButton = () => {
    const navbar = document.querySelector('.navbar__items--right');
    if (!navbar) {
      setTimeout(addResumeButton, 100);
      return;
    }

    // Check if button already exists
    if (document.getElementById('resume-generator-btn')) {
      return;
    }

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'resume-generator-btn';
    buttonContainer.style.marginLeft = '10px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.alignItems = 'center';

    // Create button
    const button = document.createElement('button');
    button.innerText = '📄 履歴書生成';
    button.style.padding = '6px 12px';
    button.style.borderRadius = '6px';
    button.style.border = 'none';
    button.style.backgroundColor = '#3b82f6';
    button.style.color = 'white';
    button.style.cursor = 'pointer';
    button.style.fontSize = '14px';
    button.style.fontWeight = '500';
    button.style.transition = 'background-color 0.2s';
    
    button.onmouseover = () => {
      button.style.backgroundColor = '#2563eb';
    };
    
    button.onmouseout = () => {
      button.style.backgroundColor = '#3b82f6';
    };

    button.onclick = () => {
      // Trigger the modal
      const event = new CustomEvent('openResumeGenerator');
      window.dispatchEvent(event);
    };

    buttonContainer.appendChild(button);
    navbar.appendChild(buttonContainer);
  };

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(addResumeButton, 100);
    });
  } else {
    setTimeout(addResumeButton, 100);
  }

  // Handle route changes in Docusaurus
  window.addEventListener('popstate', () => {
    setTimeout(addResumeButton, 100);
  });
}

export default {};
